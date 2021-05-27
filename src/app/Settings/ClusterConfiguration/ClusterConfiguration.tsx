import React from 'react';
import {
  Text,
  Title,
  Page,
  PageSection,
  PageSectionVariants,
  Form,
  FormGroup,
  ActionGroup,
  Bullseye,
  Stack,
  StackItem,
  Alert,
  Radio,
  Grid,
  GridItem,
  Checkbox,
  Flex,
  FlexItem,
  NumberInput,
  TextInput,
  Button,
  Tooltip,
  Modal,
  ModalVariant,
  Spinner,
  ValidatedOptions
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { mode_to_string } from '@app/utils/string_utils';



class ClusterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentMode: 0,
      mode: 0,
      controllerOnly: false,
      ratio: 100,
      ip_addr: "",
      ip_valid: 'default',
      ports: "",
      ports_valid: 'default',
      host: "",
      host_valid: 'default',
      controllerPort: 1,
      password: "",
      form_valid: false,
      isModalOpen: false
    };

    this.handleChange = (checked, event) => {
      const target = event.target;
      if ( target.type === 'checkbox' ){
        this.setState({ controllerOnly: target.checked })
      }
      else{
        const value = Number(target.value)
        let valid: boolean
        if( value == 0 || value == 1 ){
          valid = true;
        }
        else{
          if(this.state.ports != "" && this.state.host != "" && this.state.ports_valid === "default" && this.state.host_valid === "default" && this.state.ip_valid === "default"){
            valid = true;
          }
          else{
            valid = false;
          }
        }
        this.setState({ mode: value , form_valid: valid })
      }
    };

    this.onMinus = () => {
      this.setState({
        ratio: this.state.ratio - 1
      });
    };

    this.onChange = event => {
      const newRatio = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        ratio: newRatio < 1 ? 1: newRatio
      });
    };

    this.onPlus = () => {
      this.setState({
        ratio: this.state.ratio + 1
      });
    };

    this.onPortMinus = () => {
      this.setState({
        controllerPort: this.state.controllerPort - 1
      });
    };

    this.onPortChange = event => {
      const newPort = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        controllerPort: newPort > 65535 ? 65535 : newPort < 1 ? 1 : newPort
      });
    };

    this.onPortPlus = () => {
      this.setState({
        controllerPort: this.state.controllerPort + 1
      });
    };

    this.handleIpInputChange = ip_addr => {
      let re = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
      let valid = (re.test(ip_addr) || ip_addr === "") ? 'default' : ValidatedOptions.error ;
      this.setState({ ip_addr: ip_addr, ip_valid: valid })
      if(valid == ValidatedOptions.error){
        this.setState({form_valid: false})
      }
      else{
        if(this.state.ports_valid === "default" && this.state.ports != "" && this.state.host_valid == "default" && this.state.host != ""){
          this.setState({ form_valid: true })
        }
      }
    };

    this.handlePortsListChange = ports => {
      let splitted = ports.split(',', 65535 );
      if(splitted.length == 1){
        splitted = ports.split(' ', 65535 );
      }
      let test = true;
      splitted.forEach(el => {
        let num = Number(el)
        if( isNaN(num) || num < 1 || num > 65535 ){
          test = false;
        }
      });
      let valid = test ? 'default' : ValidatedOptions.error ;
      this.setState({ ports: ports, ports_valid: valid })
      if(valid == ValidatedOptions.error){
        this.setState({form_valid: false})
      }
      else{
        if(this.state.ip_valid === "default" && this.state.ip_addr != ""  && this.state.host_valid == "default" && this.state.host != ""){
          this.setState({ form_valid: true })
        }
      }
    };

    this.handleHostChange = host => {
      let valid = host === "" ? ValidatedOptions.error : 'default';
      this.setState({ host: host, host_valid: valid })
      if(valid == ValidatedOptions.error){
        this.setState({form_valid: false})
      }
      else{
        if(this.state.ip_valid === "default" && this.state.ip_addr != ""  && this.state.ports_valid === "default" && this.state.ports != ""){
          this.setState({ form_valid: true })
        }
      }
    };

    this.handlePassword = password => {
      this.setState({ password: password })
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.UploadChanges = () => {
      let config: VPN.VpnRpcFarm = new VPN.VpnRpcFarm({
        ServerType_u32: this.state.mode
      });

      if(this.state.mode == 1){
        config.ControllerOnly_bool = this.state.controllerOnly;
        config.Weight_u32 = this.state.ratio;
      }

      if(this.state.mode == 2){
        let ports_list = this.state.ports.split(',');
        if(ports_list.length == 1){
          ports_list = this.state.ports.split(' ');
        }

        config.Ports_u32 = ports_list;
        config.NumPort_u32 = ports_list.length;
        config.PublicIp_ip = this.state.ip_addr;
        config.ControllerName_str = this.state.host;
        config.ControllerPort_u32 = this.state.controllerPort;
        config.MemberPasswordPlaintext_str = this.state.password;
        config.Weight_u32 = this.state.ratio;
      }

      api.SetFarmSetting(config).then(response => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch( error => {
        console.log(error)
      });
    }
  }

  componentDidMount(){
    api.GetFarmSetting().then( response => {
      let ports = ""
      if(response.Ports_u32 != undefined){
        if(response.Ports_u32.length > 0)
        {
          for( let i = 0; i<response.Ports_u32.length - 1; i++){
            ports = ports.concat(response.Ports_u32[i].toString() + ", ")
          }
          ports = ports.concat(response.Ports_u32[response.Ports_u32.length - 1].toString())
        }
      }
      let cp = 1
      if(response.ControllerPort_u32 != 0){
        cp = response.ControllerPort_u32;
      }


      this.setState({
        loading: false,
        currentMode: response.ServerType_u32,
        mode: response.ServerType_u32,
        controllerOnly: response.ControllerOnly_bool,
        ratio: response.Weight_u32,
        ip_addr: response.PublicIp_ip,
        ports: ports,
        host: response.ControllerName_str,
        controllerPort: cp,
        password: response.MemberPasswordPlaintext_str,
        form_valid: true
      })
    })
    .catch(error => { console.log(error)});
  }


  render(){
    const {
      loading,
      currentMode,
      mode,
      controllerOnly,
      ratio,
      ip_addr,
      ip_valid,
      ports,
      ports_valid,
      host,
      host_valid,
      controllerPort,
      password,
      form_valid,
      isModalOpen
    } = this.state;


    return (
      <React.Fragment>

      <Stack hasGutter>
      <StackItem>
      <Flex>
      <FlexItem>
      <Title headingLevel="h1" size="lg">Clustering Configuration</Title>
      <Text>Yuou can change configuration for clustering function of this VPN server.</Text>
      <Text>Clustering can realize load balancing and fault balance protection to bundle multiple VPN Servers.</Text>
      </FlexItem>
      <FlexItem alignSelf={{ default: 'alignSelfStretch' }}>
      <Bullseye>{loading ? <Spinner size="lg" /> : <Text><b>Current Mode: {mode_to_string(currentMode)}</b></Text>}</Bullseye>
      </FlexItem>
      </Flex>
      </StackItem>
      <StackItem>
      <Flex>
      <FlexItem>
      <Radio
        id="standalone"
        label="Standalone Server (No Clustering)"
        isChecked={mode == 0}
        onChange={this.handleChange}
        value="0"
      />
      <Radio
        id="controller"
        label="Cluster Controller"
        isChecked={mode == 1}
        onChange={this.handleChange}
        value="1"
      />
      <Radio
        id="member"
        label="Cluster Member Server"
        isChecked={mode == 2}
        onChange={this.handleChange}
        value="2"
      />
      </FlexItem>
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
      <Checkbox
          label="Controller Functions Only (No VPN session itself)"
          isChecked={controllerOnly}
          isDisabled={mode != 1}
          onChange={this.handleChange}
          aria-label="controlled checkbox example"
          id="check-1"
          name="check1"
        />
      </FlexItem>
      </Flex>
      </StackItem>
      <StackItem isFilled>
      <Form>
      <Flex>
      <FlexItem>
      <FormGroup label="Standard Ratio in Cluster" helperText="Standard: 100">
      <NumberInput
        isDisabled={mode == 0}
        value={ratio}
        min={1}
        onMinus={this.onMinus}
        onChange={this.onChange}
        onPlus={this.onPlus}
        inputName="ratio"
        inputAriaLabel="number input"
        minusBtnAriaLabel="minus"
        plusBtnAriaLabel="plus"
      />
      </FormGroup>
      </FlexItem>
      <FlexItem>
      <FormGroup
      label="Public IP Address"
      labelIcon={
        <Tooltip
          position="top"
          content={
            <div>When a public IP address is omitted, the IP address of the network interface used when connecting to the cluster controller will be used.</div>
              }
            >
              <span aria-label="When a public IP address is omitted, the IP address of the network interface used when connecting to the cluster controller will be used." tabIndex="0">
                <OutlinedQuestionCircleIcon />
              </span>
            </Tooltip>
          }
      helperTextInvalid="Invalid IP address format"
      validated={ip_valid}
      >
      <TextInput
            onChange={this.handleIpInputChange}
            isDisabled={mode != 2}
            value={ip_addr}
            //onChange={this.handleTextInputChange2}
            type="text"
            validated={ip_valid}
            id="cluster-public-ip"
            name="cluster-public-ip"
          />
      </FormGroup>
      </FlexItem>
      <FlexItem>
      <FormGroup
      label="Public Port List"
      labelIcon={
        <Tooltip
          position="top"
          content={
            <div>Separate multiple port numbers by a space or a comma.</div>
              }
            >
              <span aria-label="Separate multiple port numbers by a space or a comma." tabIndex="0">
                <OutlinedQuestionCircleIcon />
              </span>
            </Tooltip>
      }
      validated={ports_valid}
      helperTextInvalid="Invalid list format: must be port number separated by commas or spaces"
      >
      <TextInput
            isDisabled={mode != 2}
            onChange={this.handlePortsListChange}
            validated={ports_valid}
            value={ports}
            //onChange={this.handleTextInputChange2}
            type="text"
            id="cluster-public-ports"
            name="cluster-public-ports"
          />
      </FormGroup>
      </FlexItem>
      <FlexItem>
      <FormGroup label="Controller Host Name or IP Address" validated={host_valid} helperTextInvalid="Cannot be empty">
      <TextInput
            isDisabled={mode != 2}
            onChange={this.handleHostChange}
            validated={host_valid}
            value={host}
            //onChange={this.handleTextInputChange2}
            type="text"
            id="controller-host"
            name="controller-host"
          />
      </FormGroup>
      </FlexItem>
      <FlexItem>
      <FormGroup label="Port Number of Controller" helperText="TCP Port">
      <NumberInput
            isDisabled={mode != 2}
            value={controllerPort}
            min={1}
            max={65535}
            onMinus={this.onPortMinus}
            onChange={this.onPortChange}
            onPlus={this.onPortPlus}
            inputName="controller-port"
            inputAriaLabel="controller-port"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            //onChange={this.handleTextInputChange2}
          />
      </FormGroup>
      </FlexItem>
      <FlexItem>
      <FormGroup label="Administration Password">
      <TextInput
            isDisabled={mode != 2}
            value={password}
            onChange={this.handlePassword}
            type="password"
            id="administration-password"
            name="administration-password"
          />
      </FormGroup>
      </FlexItem>
      </Flex>
      </Form>
      </StackItem>
      <StackItem><Alert variant="warning" isInline title="The server will restart" >When you modify a clustering configuration,
      the VPN Server service restarts automatically. When this happens, all the currently connected sessions and administration-related connections will be disconnected.
      </Alert>
      </StackItem>
      <StackItem>
      <Form>
      <ActionGroup>
      <Button variant="primary" isDisabled={!form_valid} onClick={this.handleModalToggle}>Save Changes</Button>
      </ActionGroup>
      </Form>
      </StackItem>
      </Stack>
      <Modal
          variant={ModalVariant.small}
          title="Small modal header"
          titleIconVariant="warning"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.UploadChanges}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
        <p>
        You are about to change the clustering configuration.<br/><br/>
        When you change the clustering configuration, all currently connected sessions and connections for management purposes (including this management connection) will be disconnected and the server program will restart.<br/>
        When there are many server users, it could take over a minute to start.<br/><br/>
        Click 'Continue' to automatically disconnect the connection with the server. To continue management, you will need to reconnect to the server.
        </p>
        </Modal>
      </React.Fragment>
    );
  }
}

const ClusterConfig: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.light}>
  <ClusterForm />
  </PageSection>
);

export { ClusterConfig };
