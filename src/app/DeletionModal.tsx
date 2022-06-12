import * as React from 'react';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

// props are 'buttonText', 'modalText', 'onConfirm', 'isDisabled', and optionally 'externalToggle' which prevent the button from rendering
class DeletionModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>) {
    super(props);

    this.state = {
      isModalOpen: false,
      isButtonHidden: false,
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen,
      }));
    };

    this.handleConfirmClick = () => {
      this.setState({ isModalOpen: false });
      this.props.onConfirm();
    };
  }

  componentDidMount(): void {
    if (this.props.externalToggle == false || this.props.externalToggle == true) {
      this.setState({ isModalOpen: this.props.externalToggle, isButtonHidden: true });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<RouteComponentProps<{ tag: string }>>): void {
    this.setState({ isModalOpen: nextProps.externalToggle });
  }

  render(): React.Component {
    const { isModalOpen, isButtonHidden } = this.state;

    return (
      <React.Fragment>
        {isButtonHidden ? (
          ''
        ) : (
          <Button variant="primary" onClick={this.handleModalToggle} isDisabled={this.props.isDisabled}>
            {this.props.buttonText}
          </Button>
        )}
        <Modal
          variant={ModalVariant.small}
          title="Confirm Deletion"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleConfirmClick}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>,
          ]}
        >
          {this.props.modalText}
        </Modal>
      </React.Fragment>
    );
  }
}

export { DeletionModal };
