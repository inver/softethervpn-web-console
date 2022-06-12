import React from "react";
import {
  Modal,
  ModalVariant,
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Switch,
  NumberInput
} from '@patternfly/react-core';

class PolicyModal extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      isModalOpen: false,
      subjectObject: this.props.subject
    };

    this.minValue = 0;

    this.onMinus = (object, name) => {
      const subject = this.state.subjectObject;
      subject[name] = subject[name] - 1;

      this.setState({
        subjectObject: subject
      });
    };

    this.onChange = (event) => {
      const name = event.target.name;
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      const subject = this.state.subjectObject;
      subject[name] = newValue < this.minValue ? this.minValue : newValue
      this.setState({
        subjectObject: subject
      });
    };

    this.onPlus = (object, name) => {
      const subject = this.state.subjectObject;
      subject[name] = subject[name] + 1;

      this.setState({
        subjectObject: subject
      });
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.handleConfirmClick = () => {
      this.props.onConfirm(this.state.subjectObject);
      this.setState({ isModalOpen: false });
    };

    this.onSelectDataListItem = id => {
      this.setState({ selectedDataListItemId: id });
    };

    this.handlePolicySwitchChange = (checked, event) => {
      const name = event.target.name;
      const subject = this.state.subjectObject;

      subject[name] = checked;

      this.setState({ subjectObject: subject })
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ subjectObject: nextProps.subject })
  }

  render() {
    const { isModalOpen, subjectObject } = this.state;
    const list = Object.keys(subjectObject).map( (key) => {

      if(key.slice(0,7) === "policy:"){
        let content: React.Fragment;
        if(key.slice(-5) === "_bool"){
          content = (
            <Switch name={key} aria-label="Message when on" isChecked={subjectObject[key]} onChange={this.handlePolicySwitchChange} />
          )
        }
        else{
          content = (
            <NumberInput
              name={key}
              value={subjectObject[key]}
              min={this.minValue}
              onMinus={this.onMinus}
              onChange={this.onChange}
              onPlus={this.onPlus}
              inputName={key}
              inputAriaLabel="number input"
              minusBtnAriaLabel="minus"
              plusBtnAriaLabel="plus"
            />
          )
        }

        return (
          <DataListItem aria-labelledby={key} key={key.slice(7)} id={key.slice(7)}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <span id={key}>{key.slice(7)}</span>
                  </DataListCell>,
                  <DataListCell key="secondary content">{content}</DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        );
      }
    });


    return(
      <React.Fragment>
      <Button variant="primary" onClick={this.handleModalToggle} isDisabled={this.props.isDisabled}>
          Security Policy
        </Button>
        <Modal
          variant={ModalVariant.large}
          title={"Security Policy of " + subjectObject.Name_str}
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
        <DataList
          aria-label="security policy options list"
          isCompact
        >
          {list}
        </DataList>
        </Modal>
      </React.Fragment>
    )
  }
}

export { PolicyModal };
