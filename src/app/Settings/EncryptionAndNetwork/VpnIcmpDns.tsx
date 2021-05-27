import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Button,
  Modal,
  ModalVariant,
  Alert,
  Form,
  FormGroup,
  Checkbox
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class IcmpDnsCard extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: false,
      isModalOpen: false,
      icmp: false,
      dns: false,
    }

    this.handleModalToggle = () => {
      if(this.state.isModalOpen){
        this.setState({ isModalOpen: false });
      }
      else{
        this.setState({ loading: true })
        api.GetSpecialListener()
        .then( response => {
          this.setState({ loading: false, isModalOpen: true, icmp: response.VpnOverIcmpListener_bool, dns: response.VpnOverDnsListener_bool })
        })
        .catch(error => {
          console.log(error)
        });
      }

    };

    this.handleChange = (checked, event) => {
      const target = event.target;
      const name = target.name;
      this.setState({ [name]: target.checked });
    };

    this.handleConfirm = () => {
      let param: VPN.VpnRpcSpecialListener = new VPN.VpnRpcSpecialListener({
        VpnOverIcmpListener_bool: this.state.icmp,
        VpnOverDnsListener_bool: this.state.dns,
      });
      api.SetSpecialListener(param)
      .then( response => {

      })
      .catch( error => {
        console.log(error)
      });

      this.setState({ isModalOpen: false })
    };
  }


  render(){
    const { loading, isModalOpen, icmp, dns } = this.state;

    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>VPN over ICMP / DNS Server Function</b></CardHeader>
       <CardBody isFilled>
        <Stack hasGutter>
        <StackItem>
          You can establish a VPN connection over ICMP or DNS packets even if there is a firewall or routers which TCP/IP communications. You need to enable the following functions beforehand.
        </StackItem>
        <StackItem>
        <Flex>
          <FlexItem align={{ default: 'alignRight' }}>
            <Button onClick={this.handleModalToggle} variant="primary" isLoading={loading}>VPN over ICMP / DNS Settings</Button>
          </FlexItem>
        </Flex>
        </StackItem>
        </Stack>
       </CardBody>
      </Card>
      <Modal
          variant={ModalVariant.medium}
          title="VPN over ICMP / DNS Function"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleConfirm}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
          <Stack hasGutter>
          <StackItem>
          <Card>
          <CardBody>
          <Stack hasGutter>
          <StackItem>
          You can establish a VPN connection over ICMP or DNS packets even if there is a firewall or routers which TCP/IP communications.
          </StackItem>
          <StackItem>
          <Form>
            <FormGroup>
                  <Checkbox
                label="Enable VPN over ICMP Server Function"
                isChecked={icmp}
                onChange={this.handleChange}
                aria-label="enable imcp"
                id="icmp"
                name="icmp"
              />
            </FormGroup>
            <FormGroup>
                  <Checkbox
                label="Enable VPN over DNS Server Function (Uses UDP Port 53)"
                isChecked={dns}
                onChange={this.handleChange}
                aria-label="enable dns"
                id="dns"
                name="dns"
              />
            </FormGroup>
          </Form>
          </StackItem>
          </Stack>
          </CardBody>
          </Card>
          </StackItem>
          <StackItem>
          <Alert variant="warning" isInline title="Emergency Only!">
            Warning: Use this function for emergency only. It is helpful when a firewall or router is misconfigured to block TCP/IP, but either ICMP or DNS is not. It is not for long-term stable usage.
          </Alert>
          </StackItem>
          <StackItem>
          <Alert variant="info" isInline title="Version 4.0 or greater">
            Requires VPN Client / VPN Bridge internal version 4.0 or greater.
          </Alert>
          </StackItem>
          </Stack>
        </Modal>
      </React.Fragment>
    );
  }
}

export { IcmpDnsCard };
