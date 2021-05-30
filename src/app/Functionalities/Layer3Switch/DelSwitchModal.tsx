import * as React from 'react';
import {
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class DelSwitchModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      isModalOpen: false
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.handleConfirmClick = () => {
      const param: VPN.VpnRpcL3Sw = new VPN.VpnRpcL3Sw({
        Name_str: this.props.switch
      });

      api.DelL3Switch(param)
      .then( () => {
        this.props.onConfirm();
      })
      .catch( error => {
        console.log(error)
      })
    };
  }

  render(): React.Component
  {
    const { isModalOpen } = this.state;

    return(
      <React.Fragment>
      <Button variant="primary" onClick={this.handleModalToggle}>
          Delete
        </Button>
        <Modal
          variant={ModalVariant.small}
          title="Confirm Delition"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleConfirmClick}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
          This will delete the Virtual Layer 3 Switch &ldquo;{this.props.switch}&rdquo;.<br/>
          Are you sure?
        </Modal>
      </React.Fragment>
    );
  }
}

export { DelSwitchModal };
