import * as React from 'react';
import {
  Modal,
  Button,
  ModalVariant,
  Form,
  FormGroup,
  Stack,
  StackItem,
  TextInput,
  NumberInput,
  Grid,
  GridItem,
  Alert
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class NewRouteModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.minValue = 1;

    this.state = {
      isModalOpen: false,
      networkValue: "",
      networkValid: "default",
      subnetValue: "",
      subnetValid: "default",
      gatewayValue: "",
      gatewayValid: "default",
      metricValue: 100,
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.handleNetworkTextInputChange = networkValue => {
      const re = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
      const valid = ( re.test(networkValue) || networkValue === "" ) ? 'default' : "error" ;

      this.setState({ networkValue: networkValue, networkValid: valid });
    };

    this.handleSubnetTextInputChange = subnetValue => {
      const re = new RegExp("^(((255.){3}(255|254|252|248|240|224|192|128|0+))|((255.){2}(255|254|252|248|240|224|192|128|0+).0)|((255.)(255|254|252|248|240|224|192|128|0+)(.0+){2})|((255|254|252|248|240|224|192|128|0+)(.0+){3}))$");
      const valid = (re.test(subnetValue) || subnetValue === "" || subnetValue == "0.0.0.0") ? 'default' : "error" ;

      this.setState({ subnetValue: subnetValue, subnetValid: valid });
    };

    this.handleGatewayTextInputChange = gatewayValue => {
      const re = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
      const valid = ( re.test(gatewayValue) || gatewayValue === "" ) ? 'default' : "error" ;

      this.setState({ gatewayValue: gatewayValue, gatewayValid: valid });
    };

    this.onMinus = () => {
      this.setState({
        metricValue: this.state.metricValue - 1
      });
    };

    this.onChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        metricValue: newValue < this.minValue ? this.minValue : newValue
      });
    };

    this.onPlus = () => {
      this.setState({
        metricValue: this.state.metricValue + 1
      });
    };

    this.onConfirmClick = () => {
      const param: VPN.VpnRpcL3Table = new VPN.VpnRpcL3Table({
        Name_str: this.props.Switch,
        NetworkAddress_ip: this.state.networkValue,
        SubnetMask_ip: this.state.subnetValue,
        GatewayAddress_ip: this.state.gatewayValue,
        Metric_u32: this.state.metricValue
      });

      api.AddL3Table(param)
      .then( () => {
        this.props.onConfirm()
        this.setState({
          isModalOpen: false,
          networkValue: "",
          networkValid: "default",
          subnetValue: "",
          subnetValid: "default",
          gatewayValue: "",
          gatewayValid: "default",
          metricValue: 100,
        })
      })
      .catch( error => {
        alert(error)
      })
    }
  }

  render(): void {
    const {
      isModalOpen,
      networkValue,
      networkValid,
      subnetValue,
      subnetValid,
      gatewayValue,
      gatewayValid,
      metricValue
    } = this.state;

    const isConfirmDisabled = networkValue == "" || subnetValue == "" || gatewayValue == "" || networkValid == "error" || subnetValid == "error" || gatewayValid == "error";

    return(
      <React.Fragment>
      <Button variant="primary" onClick={this.handleModalToggle}>
          Add Routing Table Entry
        </Button>
        <Modal
          variant={ModalVariant.medium}
          title="New Routing Table Entry"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.onConfirmClick} isDisabled={isConfirmDisabled}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
          <Stack hasGutter>
            <StackItem>
            You can add a new routing table entry to the routing table of the Virtual Layer 3 Switch.
            <br/>
            If the destination IP address of the IP packet does not belong to any IP network that belongs to a virtual interface, the IP routing engine of the Virtual Layer 3 Switch will reference the routing table and execute the routing.
            <br/><br/>
            The virtual interface must have one IP address in the Virtual Hub. You must also specify the subnet mask of an IP network that the IP address belongs to.
            <br/>
            Routing via the Virtual Layer 3 Switches of IP spaces of multiple virtual Hubs operates based on the IP address that is specified here.
            </StackItem>
            <StackItem>
            <Grid hasGutter>
            <GridItem span={8}>
            <Form isHorizontal>
            <FormGroup label="Network Address" validated={networkValid}>
              <TextInput value={networkValue} type="text" onChange={this.handleNetworkTextInputChange} aria-label="network address input" validated={networkValid}/>
            </FormGroup>
            <FormGroup label="Subnet Mask" validated={subnetValid}>
              <TextInput value={subnetValue} type="text" onChange={this.handleSubnetTextInputChange} aria-label="subnet mask input" validated={subnetValid}/>
            </FormGroup>
            <FormGroup label="Gateway Address" validated={gatewayValid}>
              <TextInput value={gatewayValue} type="text" onChange={this.handleGatewayTextInputChange} aria-label="gateway input" validated={gatewayValid}/>
            </FormGroup>
            <FormGroup label="Metric Value">
              <NumberInput
                value={metricValue}
                min={this.minValue}
                onMinus={this.onMinus}
                onChange={this.onChange}
                onPlus={this.onPlus}
                inputName="metric input"
                inputAriaLabel="metric input"
                minusBtnAriaLabel="minus"
                plusBtnAriaLabel="plus"
              />
            </FormGroup>
            </Form>
            </GridItem>
            <GridItem span={4}>
              <Alert variant="info" isInline title="Note" >
              To specify the default gateway, specify &lsquo;0.0.0.0&rsquo; for both the network address and the subnet mask.
              </Alert>
            </GridItem>
            </Grid>
            </StackItem>
          </Stack>
        </Modal>
      </React.Fragment>
    );
  }
}

export { NewRouteModal };
