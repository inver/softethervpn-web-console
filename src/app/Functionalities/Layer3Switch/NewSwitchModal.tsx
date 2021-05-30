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
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class NewSwitchModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      isModalOpen: false,
      value: "",
      valid: "default",
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.handleTextInputChange = value => {
      this.setState({ value: value, valid: "default" });
    };

    this.handleConfirmClick = () => {
      let valid = true;
      if(this.props.switches.length > 0){
        this.props.switches.map(s => {
          if(s == this.state.value){
            valid = false;
            return;
          }
        });
      }


      if(valid){
        const param: VPN.VpnRpcL3Sw = new VPN.VpnRpcL3Sw({
          Name_str: this.state.value
        });
        api.AddL3Switch(param)
        .then( () => {
          this.setState({ value: "", valid: valid ? "default" : "error", isModalOpen: false });
          this.props.onConfirm(true);
        })
        .catch( error => {
          console.log(error)
        })
      }
      else{
        this.setState({ valid: valid ? "default" : "error" });
      }
    }
  }

  render(): void {
    const { isModalOpen, value, valid } = this.state;

    return(
      <React.Fragment>
      <Button variant="primary" onClick={this.handleModalToggle}>
          New
        </Button>
        <Modal
          variant={ModalVariant.small}
          title="New Virtual Layer 3 Switch"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleConfirmClick}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}>
          <Stack hasGutter>
          <StackItem>
            To create a new Virtual Layer 3 Switch, enter a name for the switch.<br/><br/>
            Te Virtual Layer 3 Switch cannot have the same name as another Virtual Layer 3 Switch on this VPN Server.
          </StackItem>
          <StackItem>
          <Form isHorizontal>
            <FormGroup validated={valid} helperTextInvalid="Names cannot be duplicate" label="Name">
              <TextInput value={value} validated={valid} type="text" onChange={this.handleTextInputChange} aria-label="name input" />
            </FormGroup>
          </Form>
          </StackItem>
          </Stack>
        </Modal>
      </React.Fragment>
    );
  }
}

export { NewSwitchModal };
