import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";


class AdminPasswordCard extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      isModalOpen: false,
      password: "",
      confirm: "",
      valid: true,
    }

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen,
        password: "",
        confirm: "",
      }));
    };

    this.handlePasswordInputChange = value => {
      this.setState({ password: value, valid: this.state.confirm === value });
    };

    this.handleConfirmInputChange = value => {
      this.setState({ confirm: value, valid: this.state.password === value });
    };

    this.confirmClick = () => {
      const param: VPN.VpnRpcSetPassword = new VPN.VpnRpcSetPassword({
        PlainTextPassword_str: this.state.password,
      });

      api.SetServerPassword(param)
      .then(() => {
        this.setState({ isModalOpen: false });
        window.location.reload();
      })
      .catch( error => {
        console.log(error)
      });
    };
  }


  render(): void {
    const { isModalOpen, password, confirm, valid } = this.state;

    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>Administrator Password</b></CardHeader>
       <CardBody isFilled>
       <Stack hasGutter>
       <StackItem>
        You can modify the administrator password for this VPN Server
       </StackItem>
       <StackItem>
        <Flex>
        <FlexItem align={{ default: 'alignRight' }}>
          <Button variant="primary" onClick={this.handleModalToggle}>Change Administrator Password</Button>
        </FlexItem>
        </Flex>
       </StackItem>
       </Stack>
       </CardBody>
      </Card>
      <Modal
          variant={ModalVariant.small}
          position="top"
          title="Change Administrator Password"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.confirmClick} isDisabled={!valid || password == "" || confirm == ""}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
        <Form isHorizontal>
        <FormGroup label="New Password">
          <TextInput value={password} type="password" onChange={this.handlePasswordInputChange} aria-label="new password" />
        </FormGroup>
        <FormGroup label="Confirm Password">
          <TextInput value={confirm} type="password" onChange={this.handleConfirmInputChange} aria-label="confirm password" />
        </FormGroup>
        </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

export { AdminPasswordCard };
