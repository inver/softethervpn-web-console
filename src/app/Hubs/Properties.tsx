import React from 'react';
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  Switch,
  NumberInput,
  ActionGroup,
  Button,
  Flex,
  FlexItem,
  Radio
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { truncate_qm } from '@app/utils/string_utils';
import { ToastAlertGroup } from '@app/Hubs/Notifications';
import { infoListGlobal } from  '@app/index';

class Properties extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      hub: this.props.hub,
      type: 0,
      password: "",
      confirm: "",
      valid: "default",
      enumAnon: false,
      isOnline: true,
      limit: false,
      max: 1,
      dynamic: false,
      showAlert: false,
      alertTitle: "",
      alertVariant: 'info',
      alertBody: ""
    };

    this.minValue = 1;

    this.onNumMinus = () => {
      this.setState({
        max: this.state.max - 1
      });
    };

    this.onNumChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        max: newValue < this.minValue ? this.minValue : newValue
      });
    };

    this.onNumPlus = () => {
      this.setState({
        max: this.state.max + 1
      });
    };

    this.handlePassInputChange = (value, event) => {
      const name = event.target.name;
      const passObject = { password: this.state.password, confirm: this.state.confirm, valid: this.state.valid }

      passObject[name] = value;
      passObject['valid'] = passObject['password'] == passObject['confirm'] ? "default" : 'error';

      this.setState(passObject);
    };

    this.handleEnumChange = isChecked => {
      this.setState({ enumAnon: isChecked });
    };

    this.handleOnlineChange = isChecked => {
      this.setState({ isOnline: isChecked });
    };

    this.handleLimitChange = isChecked => {
      this.setState({ limit: isChecked });
    };

    this.handleTypeChange = (isChecked, event) => {
      const name = event.target.name;
      if(name == "Static"){
        isChecked = !isChecked;
      }

      this.setState({ [event.target.value]: isChecked })
    };

    this.handleSaveClick = () => {
      const param: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub({
        HubName_str: this.state.hub,
        AdminPasswordPlainText_str: this.state.password,
        Online_bool: this.state.isOnline,
        MaxSession_u32: this.state.limit ? this.state.max : 0,
        NoEnum_bool: this.state.anumAnon,
        HubType_u32: (infoListGlobal.ServerType_u32 == 0 ? 0 : (this.state.dynamic ? 2 : 1))
      });

      api.SetHub(param)
      .then(response => {
        const title = "Virtual Hub properties have been saved"
        const variant = "info"
        this.setState({
          type: response.HubType_u32,
          password: "",
          confirm: "",
          enumAnon: response.NoEnum_bool,
          isOnline: response.Online_bool,
          limit: response.MaxSession_u32 == 0 ? false : true,
          max: response.MaxSession_u32 == 0 ? 1 : response.MaxSession_u32,
          showAlert: true,
          alertTitle: title,
          alertVariant: variant,
          alertBody: ""
        });
        this.setState({ showAlert: false });
      })
      .catch( error => {
        const title = "An error have occurred"
        const variant = "error"
        this.setState({
          showAlert: true,
          alertTitle: title,
          alertVariant: variant,
          alertBody: error
        })
        this.setState({ showAlert: false });
      });
    };
  }

  loadHub(): void {
    const param: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub({
      HubName_str: this.state.hub
    })

    api.GetHub(param)
    .then( response => {
      this.setState({
        type: response.HubType_u32,
        password: "",
        confirm: "",
        enumAnon: response.NoEnum_bool,
        isOnline: response.Online_bool,
        limit: response.MaxSession_u32 == 0 ? false : true,
        max: response.MaxSession_u32 == 0 ? 1 : response.MaxSession_u32
      });
    })
    .catch( error => {
      alert(error)
      window.location = truncate_qm(window.location.toString());
    })
  }

  componentDidMount(): void {
    this.loadHub()
  }


  render(): React.Fragment {
    const {
      type,
      password,
      confirm,
      valid,
      enumAnon,
      isOnline,
      limit,
      max,
      dynamic,
      showAlert,
      alertTitle,
      alertVariant,
      alertBody
    } = this.state;

    return(
      <React.Fragment>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
          <Card>
          <CardBody>
          <Form isHorizontal>
          <FormGroup label="Password">
            <TextInput name="password" value={password} type="password" onChange={this.handlePassInputChange} aria-label="password input" />
          </FormGroup>
          <FormGroup label="Confirm" validated={valid} helperTextInvalid="Passwords do not match">
            <TextInput name="confirm" validated={valid} value={confirm} type="password" onChange={this.handlePassInputChange} aria-label="password confirm input" />
          </FormGroup>
          <FormGroup>
            <Checkbox
              label="Do not Enumerate to Anonymous Users"
              isChecked={enumAnon}
              onChange={this.handleEnumChange}
              aria-label="enumerate to anonymous checkbox"
              id="enumAnon"
              name="enumAnon"
            />
          </FormGroup>
          <FormGroup label="Status">
            <Switch
              id="online-switch"
              label="Virtual Hub will be set online"
              labelOff="Virtual hub will be set offline"
              isChecked={isOnline}
              onChange={this.handleOnlineChange}
            />
          </FormGroup>
          <FormGroup label="Limit Hub Sessions">
            <Checkbox
              label="Limit Max VPN Sessions"
              isChecked={limit}
              onChange={this.handleLimitChange}
              aria-label="allow limiting vpn sessions"
              id="limit"
              name="limit"
            />
          </FormGroup>
          <FormGroup label="Max Number of Sessions">
            <NumberInput
              isDisabled={!limit}
              value={max}
              min={this.minValue}
              onMinus={this.onNumMinus}
              onChange={this.onNumChange}
              onPlus={this.onNumPlus}
              inputName="sessions input"
              inputAriaLabel="sessions input"
              minusBtnAriaLabel="minus"
              plusBtnAriaLabel="plus"
            />
            <p>Sessions generated on server side by Local Bridges,<br/> Virtual NAT or Cascade Connections will not be counted
            </p>
          </FormGroup>
          {type == 1 ?
            <FormGroup>
            <Radio
              isChecked={!dynamic}
              name="Static"
              onChange={this.handleTypeChange}
              label="Static Virtual Hub"
              id="radio-static"
              value="dynamic"
            />
            <Radio
              isChecked={dynamic}
              name="Dynamic"
              onChange={this.handleTypeChange}
              label="Dynamic VIrtual Hub"
              id="radio-dynamic"
              value="dynamic"
            />
            </FormGroup> : ""}
          <ActionGroup>
            <Button onClick={this.handleSaveClick} isDisabled={valid == "error"}>Save</Button>
          </ActionGroup>
          </Form>
          </CardBody>
          </Card>
        </FlexItem>
      </Flex>
        <ToastAlertGroup title={alertTitle} variant={alertVariant} child={alertBody} add={showAlert}/>
      </React.Fragment>
    );
  }
}

export { Properties };
