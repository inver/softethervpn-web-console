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
  Select,
  SelectOption,
  SelectVariant
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class NewIfModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.hubOptions = [<SelectOption key={0} value='Loading...' isPlaceholder />];

    this.state = {
      isModalOpen: false,
      isHubOpen: false,
      selectedHub: null,
      ipValue: "",
      ipValid: "default",
      subnetValue: "",
      subnetValid: "default",
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.onHubToggle = isHubOpen => {
      this.setState({
        isHubOpen
      });
    };

    this.onHubSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        this.setState({
          selectedHub: selection,
          isHubOpen: false
        });
      }
    };

    this.handleIpTextInputChange = ipValue => {
      const re = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
      const valid = (re.test(ipValue) || ipValue === "") ? 'default' : "error" ;

      this.setState({ ipValue: ipValue, ipValid: valid });
    };

    this.handleSubnetTextInputChange = subnetValue => {
      const re = new RegExp("^(((255.){3}(255|254|252|248|240|224|192|128|0+))|((255.){2}(255|254|252|248|240|224|192|128|0+).0)|((255.)(255|254|252|248|240|224|192|128|0+)(.0+){2})|((255|254|252|248|240|224|192|128|0+)(.0+){3}))$");
      const valid = (re.test(subnetValue) || subnetValue === "") ? 'default' : "error" ;

      this.setState({ subnetValue: subnetValue, subnetValid: valid });
    };

    this.handleConfirmClick = () => {
      const param: VPN.VpnRpcL3If = new VPN.VpnRpcL3If({
        Name_str: this.props.Switch,
        HubName_str: this.state.selectedHub,
        IpAddress_ip: this.state.ipValue,
        SubnetMask_ip: this.state.subnetValue
      });

      api.AddL3If(param)
      .then( () =>  {
        this.props.onConfirm();
        this.setState({ isModalOpen: false, selectedHub: null, ipValue: "", subnetValue: "" });
      })
      .catch( error => {
        console.log(error)
        alert(error)
      });
    }
  }

  loadHubs(): void {
    api.EnumHub()
    .then( response => {
      if( response.HubList.length > 0 ){
        let counter = -1;

        this.hubOptions = response.HubList.map((hub) => {
          if(counter == -1){
            this.setState({ selectedHub: hub.HubName_str })
          }
          counter++;
          return(
            <SelectOption key={counter} value={hub.HubName_str} />
          );
        });
      }
    })
    .catch( error => {
      console.log(error)
    });
  }

  componentDidMount(): void {
    this.loadHubs()
  }

  render(): React.Component {
    const {
      isModalOpen,
      isModalOpen,
      isHubOpen,
      selectedHub,
      ipValue,
      ipValid,
      subnetValue,
      subnetValid,
     } = this.state;

     const isConfirmDisabled = ipValue == "" || subnetValue == "" || ipValid == "error" || subnetValid == "error";

    return(
      <React.Fragment>
      <Button variant="primary" onClick={this.handleModalToggle}>
          New Virtual Interface
        </Button>
        <Modal
          variant={ModalVariant.small}
          title="Add a new Virtual Interface"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleConfirmClick} isDisabled={isConfirmDisabled}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
        <Stack hasGutter>
        <StackItem>
          Add a new virtual interface to the Virtual Layer 3 Switch.
          <br/><br/>
          You must define the IP network that the virtual interface belongs to and the IP address of the interface itself.
          <br/>
          Please select the name of the virtual Hub that the interface will attach to.
        </StackItem>
        <StackItem>
          <Form isHorizontal>
          <FormGroup label="Virtual Hub">
          <Select
            variant={SelectVariant.single}
            aria-label="Hub Select Input"
            onToggle={this.onHubToggle}
            onSelect={this.onHubSelect}
            selections={selectedHub}
            isOpen={isHubOpen}
          >
            {this.hubOptions}
          </Select>
          </FormGroup>
          <FormGroup>
          </FormGroup>
          </Form>
        </StackItem>
        <StackItem>
        The virtual interface must have one IP address in the Virtual Hub. You must also specify the subnet mask of an IP network that the IP address belongs to.
        <br/>
        Routing via the Virtual Layer 3 Switches  attaching to multiple virtual Hubs operates based on the IP address is specified here.
        </StackItem>
        <StackItem>
        <Form isHorizontal>
          <FormGroup label="IP Address" validated={ipValid}>
            <TextInput value={ipValue} type="text" onChange={this.handleIpTextInputChange} aria-label="ip input" validated={ipValid}/>
          </FormGroup>
          <FormGroup label="Subnet Mask" validated={subnetValid}>
            <TextInput value={subnetValue} type="text" onChange={this.handleSubnetTextInputChange} aria-label="subnet mask input" validated={subnetValid}/>
          </FormGroup>
        </Form>
        </StackItem>
        </Stack>
        </Modal>
      </React.Fragment>
    );
  }
}

export { NewIfModal };
