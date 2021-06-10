import React from 'react';
import {
  Card,
  Modal,
  ModalVariant,
  Button,
  Bullseye,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  NumberInput,
  Radio
} from '@patternfly/react-core';
import {
  PlusCircleIcon
} from '@patternfly/react-icons';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { infoListGlobal } from  '@app/index';

class NewHub extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);
    this.state = {
      isNewHubModalOpen: false,
      newHub: "",
      newOffline: false,
      newLimit: false,
      newMax: 1,
      newPass: "",
      newConf: "",
      newEnum: false,
      newDynamic: false,
      valid: "default"
    };

    this.handleNewHubModalToggle = () => {
      this.setState(({ isNewHubModalOpen }) => ({
        isNewHubModalOpen: !isNewHubModalOpen
      }));
    };

    this.handleNameTextInputChange = value => {
      this.setState({ newHub: value });
    };

    this.handlePassTextInputChange = (value, event) => {
      const pass_object = { newPass: this.state.newPass, newConf: this.state.newConf, valid: "default" };
      const name = event.currentTarget.name;
      pass_object[name] = value;
      pass_object["valid"] = pass_object["newPass"] == pass_object["newConf"] ? "default" : "error";
      this.setState(pass_object);
    };

    this.handleCheckboxes = (isChecked) => {
      const name = event.target.name;
      this.setState({ [name]: isChecked })
    };

    this.minValue = 1;

    this.onMinus = () => {
      this.setState({
        newMax: this.state.newMax - 1
      });
    };

    this.onChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        newMax: newValue < this.minValue ? this.minValue : newValue
      });
    };

    this.onPlus = () => {
      this.setState({
        newMax: this.state.newMax + 1
      });
    };

    this.handleTypeChange = (isChecked, event) => {
      const name = event.target.name;
      if(name == "newStatic"){
        isChecked = !isChecked;
      }

      this.setState({ [event.target.value]: isChecked })
    };

    this.onConfirmClick = () => {
      const param: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub({
        HubName_str: this.state.newHub,
        AdminPasswordPlainText_str: this.state.newPass,
        Online_bool: !this.state.newOffline,
        MaxSession_u32: this.state.newLimit ? this.state.newMax : 0,
        NoEnum_bool: this.state.newEnum,
        HubType_u32: (infoListGlobal.ServerType_u32 == 0 ? 0 : (this.state.newDynamic ? 2 : 1))
      });

      api.CreateHub(param)
      .then( () => {
        this.setState({
          isNewHubModalOpen: false,
          newHub: "",
          newOffline: false,
          newLimit: false,
          newMax: 0,
          newPass: "",
          newConf: "",
          newEnum: false,
          newDynamic: false,
          valid: "default"
        })
        this.props.reload()
      })
    };
  }

  render(): React.Component {
    const serverTypeInt = infoListGlobal.ServerType_u32;
    const {
      isNewHubModalOpen,
      newHub,
      newOffline,
      newLimit,
      newMax,
      newPass,
      newConf,
      newEnum,
      newDynamic,
      valid
    } = this.state;
    const isConfirmDisabled = newHub == "" || valid == "error";

    return(
      <React.Fragment>
      <Card isHoverable isCompact isRounded onClick={this.handleNewHubModalToggle} isSelectable>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h2" size="md">
              Add a new Virtual Hub to the server
            </Title>
          </EmptyState>
        </Bullseye>
      </Card>
      <Modal // creation modal
        variant={ModalVariant.large}
        title="New Virtual Hub"
        isOpen={isNewHubModalOpen}
        onClose={this.handleNewHubModalToggle}
        actions={[
          <Button key="confirm" variant="primary" onClick={this.onConfirmClick} isDisabled={isConfirmDisabled}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={this.handleNewHubModalToggle}>
            Cancel
          </Button>
        ]}
      >
        <Form isHorizontal>
        <FormGroup label="Virttual Hub Name">
          <TextInput value={newHub} type="text" onChange={this.handleNameTextInputChange} aria-label="hub name input" />
        </FormGroup>
        <FormGroup>
          <Checkbox
            label="Set the new Virtual Hub offline"
            isChecked={newOffline}
            onChange={this.handleCheckboxes}
            aria-label="New Hub offline"
            id="check-offline"
            name="newOffline"
          />
        </FormGroup>
        <FormGroup>
        <Checkbox
          label="Limit Max VPN Sessions"
          isChecked={newLimit}
          onChange={this.handleCheckboxes}
          aria-label="New Hub limit sessions"
          id="check-limit"
          name="newLimit"
        />
        </FormGroup>
        <FormGroup label="Maximum number of sessions">
          <NumberInput
            value={newMax}
            min={this.minValue}
            onMinus={this.onMinus}
            onChange={this.onChange}
            onPlus={this.onPlus}
            inputName="input"
            inputAriaLabel="max sessions input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            isDisabled={!newLimit}
          />
        </FormGroup>
        {serverTypeInt == 1 ?
          <FormGroup>
          <Radio
            isChecked={!newDynamic}
            name="newStatic"
            onChange={this.handleTypeChange}
            label="Static Virtual Hub"
            id="radio-static"
            value="newDynamic"
          />
          <Radio
            isChecked={newDynamic}
            name="newDynamic"
            onChange={this.handleTypeChange}
            label="Dynamic VIrtual Hub"
            id="radio-dynamic"
            value="newDynamic"
          />
          </FormGroup> : ""}
        <FormGroup label="Password">
          <TextInput name="newPass" value={newPass} type="password" onChange={this.handlePassTextInputChange} aria-label="password input" />
        </FormGroup>
        <FormGroup label="Confirm" validated={valid} helperTextInvalid="Passwords do not match">
          <TextInput name="newConf" value={newConf} type="password" onChange={this.handlePassTextInputChange} aria-label="confirm password input" validated={valid}/>
        </FormGroup>
        <FormGroup>
          <Checkbox
            label="Do not Enumarate to Anonymous Users"
            isChecked={newEnum}
            onChange={this.handleCheckboxes}
            aria-label="No Enumerate"
            id="check-enum"
            name="newEnum"
          />
        </FormGroup>
        </Form>
      </Modal>
      </React.Fragment>
    );
  }
}

export { NewHub };
