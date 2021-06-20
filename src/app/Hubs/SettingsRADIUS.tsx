import React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Form,
  FormGroup,
  Button,
  TextInput,
  Switch,
  NumberInput,
  Stack,
  StackItem,
  Alert
} from '@patternfly/react-core';
import { ToastAlertGroup } from '@app/Hubs/Notifications';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

const SettingsRADIUS: React.FunctionComponent = (props) => (
  <React.Fragment>
    <PageSection variant={PageSectionVariants.white}>
    <Stack hasGutter>
    <StackItem>
      To use an external RADIUS server to verify login attempts to the Virtual Hub {'"' + props.hub + '"'}, specify an external RADIUS server that verifies the user name and password.
    </StackItem>
    <StackItem>
      <Alert variant="info" isInline title="Notes" >
      The RADIUS server must accept requests from IP addresses of this VPN Server.
      Also, authentication by Password Authentication Protocol (PAP) must be enabled.
      <br/>
      <br/>
      When using Windows NT Domain Controller or Windows Server Active Directory Controller as an external authentication server, you must setup the VPN Server computer to join the domain. To use NT Domain Authentication, there are no items to configure here.
      </Alert>
    </StackItem>
    </Stack>
    </PageSection>
    <PageSection>
    <RADIUSForm hub={props.hub}/>
    </PageSection>
  </React.Fragment>
)

class RADIUSForm extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      hub: this.props.hub,
      isRADIUSChecked: false,
      hostValue: "",
      portValue: 1812,
      secretValue: "",
      confirmValue: "",
      retryValue: 500,
      confirmValid: "default",
      spawnAlert: false,
      variant: "info",
      child: ""
    };

    this.minValue = {portValue: 1, retryValue: 500};
    this.maxValue = {portValue: 65535, retryValue: 10000};

    this.onMinus = (_, name) => {
      this.setState({
        [name]: this.state[name] - 1
      });
    };

    this.onChange = event => {
      const name = event.target.name;
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        [name]: newValue > this.maxValue[name] ? this.maxValue[name] : newValue < this.minValue[name] ? this.minValue[name] : newValue
      });
    };

    this.onPlus = (_, name) => {
      this.setState({
        [name]: this.state[name] + 1
      });
    };

    this.handleSwitchChange = (isChecked) => {
      this.setState({ isRADIUSChecked: isChecked });
    };

    this.handleTextInputChange = (value, event) => {
      const name = event.target.name;
      if(name == "confirmValue"){
        this.setState({ confirmValid: this.state.secretValue == value ? "default" : "error" })
      }

      if(name == "secretValue" && value == "" && this.state.confirmValue == ""){
        this.setState({ confirmValid: "default" })
      }

      this.setState({ [name]: value });
    };

    this.onSaveClick = () => {
      this.setRADIUS()
      this.loadRADIUS()
    };
  }

  componentDidMount(){
    this.loadRADIUS()
  }

  loadRADIUS(){
    const param: VPN.VpnRpcRadius = new VPN.VpnRpcRadius({
      HubName_str: this.state.hub
    });

    api.GetHubRadius(param)
    .then( response => {
      this.setState({
        isRADIUSChecked: response.RadiusServerName_str != "",
        hostValue: response.RadiusServerName_str,
        portValue: response.RadiusPort_u32 == 0 ? 1812 : response.RadiusPort_u32,
        secretValue: response.RadiusSecret_str,
        confirmValue: response.RadiusSecret_str,
        retryValue: response.RadiusRetryInterval_u32 == 0 ? 500 : response.RadiusRetryInterval_u32,
      })
    })
    .catch( error => console.log(error))
  }

  setRADIUS(){
    const param: VPN.VpnRpcRadius = new VPN.VpnRpcRadius({
      HubName_str: this.state.hub
    });

    if(this.state.isRADIUSChecked){
      param.RadiusServerName_str = this.state.hostValue;
      param.RadiusPort_u32 = this.state.portValue;
      param.RadiusSecret_str = this.state.secretValue;
      param.RadiusRetryInterval_u32 = this.state.retryValue;
    }

    api.SetHubRadius(param)
    .then( response => {
      this.setState({
        hostValue: response.RadiusServerName_str,
        portValue: response.RadiusPort_u32,
        secretValue: response.RadiusSecret_str,
        confirmValue: response.RadiusSecret_str,
        retryValue: response.RadiusRetryInterval_u32,
        spawnAlert: true,
        variant: "info", child: "RADIUS settings for the hub '" + this.state.hub + "' have been saved."
      });
      this.setState({ spawnAlert: false })
    })
    .catch( error => {
      this.setState({ spawnAlert: true, variant: "danger", child: String(error) }); // ironically child cannot be a true child but instead must be a string
      this.setState({ spawnAlert: false })
    })
  }

  render(){
    const {
      isRADIUSChecked,
      hostValue,
      portValue,
      secretValue,
      confirmValue,
      retryValue,
      confirmValid,
      spawnAlert,
      variant,
      child
    } = this.state;

    const saveDisabled = isRADIUSChecked && (confirmValid == "error" || confirmValue != secretValue || hostValue == "");

    return(
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
        <Switch
        id="simple-switch"
        label="Use RADIUS Authentication"
        labelOff="Do not use RADIUS Authentication"
        isChecked={isRADIUSChecked}
        onChange={this.handleSwitchChange}
        />
      </StackItem>
      <StackItem>
        <Form isHorizontal>
          { isRADIUSChecked ?
            <React.Fragment>
            <FormGroup label="RADIUS Server Host Name or IP" helperText="Separate multiple hostnames with commas (,) or semicolons (;)">
              <TextInput name="hostValue" value={hostValue} type="text" onChange={this.handleTextInputChange} aria-label="host name or ip input" />
            </FormGroup>

            <FormGroup label="Port" helperText="UDP Port">
            <NumberInput
              value={portValue}
              min={this.minValue.portValue}
              max={this.maxValue.portValue}
              onMinus={this.onMinus}
              onChange={this.onChange}
              onPlus={this.onPlus}
              inputName="portValue"
              inputAriaLabel="port input"
              minusBtnAriaLabel="minus"
              plusBtnAriaLabel="plus"
            />
            </FormGroup>

            <FormGroup label="Shared Secret">
              <TextInput name="secretValue" value={secretValue} type="password" onChange={this.handleTextInputChange} aria-label="shared secret input" />
            </FormGroup>

            <FormGroup label="Confirm Shared Secret" helperTextInvalid="Shared Secret must match the confirmation" validated={confirmValid}>
              <TextInput name="confirmValue" value={confirmValue} type="password" onChange={this.handleTextInputChange} aria-label="confirm shared secret input" validated={confirmValid}/>
            </FormGroup>

            <FormGroup label="Retry Interval">
              <NumberInput
                value={retryValue}
                min={this.minValue.retryValue}
                max={this.maxValue.retryValue}
                onMinus={this.onMinus}
                onChange={this.onChange}
                onPlus={this.onPlus}
                inputName="retryValue"
                inputAriaLabel="retry interval input"
                minusBtnAriaLabel="minus"
                plusBtnAriaLabel="plus"
              />
            </FormGroup>
            </React.Fragment>
            : ""}
        </Form>
      </StackItem>
      <StackItem>
        <Button isDisabled={saveDisabled} onClick={this.onSaveClick}>Save</Button>
      </StackItem>
      </Stack>
      <ToastAlertGroup add={spawnAlert} variant={variant} child={child} />
      </React.Fragment>
    )
  }
}

export { SettingsRADIUS };
