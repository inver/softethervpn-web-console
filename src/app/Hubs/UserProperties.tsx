import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  FormSection,
  TextInput,
  Flex,
  FlexItem,
  Text,
  DatePicker,
  Checkbox,
  SimpleList,
  SimpleListItem,
  SimpleListGroup,
  Divider,
  Stack,
  StackItem,
  Button,
  TextContent,
  Text,
  FileUpload,
  Grid,
  GridItem
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { ViewCertModal } from '@app/CertificateViewer/CertificateViewer';
import { UserPolicyModal } from '@app/Hubs/UserSecurityPolicy';
import { ToastAlertGroup } from '@app/Hubs/Notifications';

function base64ToHex(str: string): string
{
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

function hexToBase64(str: string)
{
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}

class UserSettings extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.groupAuthItems = [
      {
        child: "Anonymous authentication",
        key: 0,
      },
      {
        child: "Password authentication",
        key: 1,
      },
      {
        child: "Individual certificate authentication",
        key: 2,
      },
      {
        child: "Signed certificate authentication",
        key: 3,
      },
      {
        child: "RADIUS authentication",
        key: 4,
      },
      {
        child: "Windows NT authentication",
        key: 5,
      }
    ];

    this.state = {
      userObject: new VPN.VpnRpcSetUser({
        AuthType_u32: 1,
        HubName_str: this.props.hub,
        ExpireTime_dt: new Date(0).toISOString()
      }),
      create: this.props.create,
      expires: false,
      confirm: "",
      confirmValid: "default",
      file: "",
      filename: "",
      isFileLoading: false,
      isRejected: false,
      limitCN: false,
      limitSN: false,
      specifyUser: false,
      specifyUserValue: "",
      showAlert: false,
      alertTitle: "",
      alertVariant: 'info',
      alertBody: "",
      serialNumber: ""
    };

    this.handleTextInputChange = (value, event) => {
      const name = event.target.name;
      const newState = this.state;
      if(name == "Serial_bin"){
        newState.userObject[name] = value%2 == 0 ? hexToBase64(value) : this.state.userObject[name];
      }
      else{
        newState.userObject[name] = value;
      }

      this.setState(newState)
    };

    this.handleDateChange = date => {
      const user = this.state.userObject;
      const newDate = new Date(date).toISOString();

      user.ExpireTime_dt = newDate;

      this.setState({ userObject: user });
    };

    this.handleExpiresChange = isChecked => {
      const user = this.state.userObject;
      if(!isChecked){
        const date = new Date(32400000);
        user.ExpireTime_dt = date.toISOString();
      }
      this.setState({ expires: isChecked, userObject: user })
    };

    this.onAuthSelect = (selectedItem, selectedItemProps) => {
      const id = selectedItemProps.id;
      const user = this.state.userObject;
      user.AuthType_u32 = id;

      this.setState({ userObject: user })
      // console.log('new selection SimpleListGroupDemo', selectedItem, selectedItemProps);
    };

    this.handlePasswordTextInputChange = (value, event) => {
      const name = event.target.name;
      const newState = { userObject: this.state.userObject, confirm: this.state.confirm, confirmValid: this.state.confirmValid };

      if(name == "Auth_Password_str"){
        newState.userObject.Auth_Password_str = value;
        newState.confirmValid = value == newState.confirm ? "default" : "error";
      }
      else{
        newState.confirm = value;
        newState.confirmValid = newState.userObject.Auth_Password_str == value ? "default" : "error";
      }

      this.setState(newState)
    };

    this.handleSetPolicyChange = isChecked => {
      const user = this.state.userObject;
      user.UsePolicy_bool = isChecked;

      this.setState({ userObject: user })
    };

    this.handleFileChange = (file, filename) => {
      if(filename != ""){

        file.text().then( result => {
          if(result.slice(0,27) != "-----BEGIN CERTIFICATE-----"){
            this.setState({ file: file, filename: filename, isRejected: true })
          }
          else{
            const user = this.state.userObject;
            user.UserX_bin = result;
            this.setState({ userObject: user, file: file, filename: filename, isRejected: false })
          }
        })
        .catch( error => {
          console.log(error)
        });
      }
      else{
        const user = this.state.userObject;
        user.UserX_bin = "";
        this.setState({ userObject: user, file: file, filename: filename, isRejected: false })
      }
    };

    this.handleFileRejected = () => this.setState({ isRejected: true });
    this.handleFileReadStarted = () => this.setState({ isLoading: true });
    this.handleFileReadFinished = () => this.setState({ isLoading: false });

    this.handleSignedCheckboxChange = (isChecked, event) => {
      const name = event.target.name;
      const user = this.state.userObject;

      if(name == "limitCN"){
        user.CommonName_utf = isChecked ? user.CommonName_utf : "";
      }
      else{
        user.Serial_bin = isChecked ? user.Serial_bin : "";
      }
      this.setState({ userObject: user, [name]: isChecked });
    };

    this.handleSpecifyUserChange = (checked, event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
      const user = this.state.userObject;

      if(user.AuthType_u32 == 4){
        if( name == "specifyUserValue"){
          user.RadiusUsername_utf = value;
        }

        if( name == "specifyUser" && !value ){
          user.RadiusUsername_utf = "";
        }
      }

      if(user.AuthType_u32 == 5){
        if( name == "specifyUserValue"){
          user.NtUsername_utf = value;
        }

        if( name == "specifyUser" && !value ){
          user.NtUsername_utf = "";
        }
      }

      this.setState({ userObject: user, [name]: value });
    };

    this.handlePolicyChange = (newUserObject) => {
      const oldUserObject = this.state.userObject;
      Object.keys(newUserObject).forEach( key => {
        if(key.slice(0,6) === "policy:" ){
          oldUserObject[key] = newUserObject[key];
        }
      });

      this.setState({ userObject: oldUserObject })
    };

    this.handleEditSaveClick = () => {
      this.saveUser()
    };

    this.handleSerialNumberTextInputChange = value => {
      console.log(hexToBase64(value))
      const user = this.state.userObject;
      const uppValue = value.toUpperCase();
      const bytes = new Uint8Array(Math.ceil(uppValue.length / 2));
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(uppValue.substr(i * 2, 2), 16)

      user.Serial_bin = bytes;
      this.setState({ userObject: user, serialNumber: uppValue })
    };
  }

  saveUser(): void {
    const param = this.state.userObject;
    param.UserX_bin = new TextEncoder().encode(param.UserX_bin);
    delete param["CreatedTime_dt"];
    delete param["UpdatedTime_dt"];
    delete param["HashedKey_bin"];
    delete param["NtLmSecureHash_bin"];

    if(this.props.create){
      api.CreateUser(param)
      .then( () => {
        this.setState({
          showAlert: true,
          alertTitle: "A new user has been created",
          alertVariant: 'info',
          alertBody: ""
        })
        this.setState({ showAlert: false })
        this.props.hideOnConfirmation()
        this.props.updateUser()
      })
      .catch( error => {
        this.setState({
          showAlert: true,
          alertTitle: "An error has occurred",
          alertVariant: 'danger',
          alertBody: error.toString()
        })
        this.setState({ showAlert: false })
      });
    }
    else{
      api.SetUser(param)
      .then( () => {
        this.setState({
          showAlert: true,
          alertTitle: "User Settings correctly updated",
          alertVariant: 'info',
          alertBody: ""
        })
        this.setState({ showAlert: false })
        this.props.hideOnConfirmation()
        this.props.updateUser()
      })
      .catch( error => {
        this.setState({
          showAlert: true,
          alertTitle: "An error has occurred",
          alertVariant: 'danger',
          alertBody: error.toString()
        })
        this.setState({ showAlert: false })
      });
    }
  }

  initializeExtras(userObject: VPN.VpnRpcSetUser): void {
    const userObject = this.state.userObject;
    const date = new Date(userObject.ExpireTime_dt);
    const expires = !(date.getTime() == 32400000);
    const specifyUserValue = userObject.AuthType_u32 == 4 ? userObject.RadiusUsername_utf : userObject.AuthType_u32 == 5 ? userObject.NtUsername_utf : "";
    const specifyUser = !(specifyUserValue == "")
    const serialNumber = base64ToHex(userObject.Serial_bin);
    const limitCN = !(userObject.CommonName_utf == "");
    const limitSN = !(serialNumber == "")
    this.setState({ expires, specifyUser, specifyUserValue, serialNumber, limitCN, limitSN });
  }

  componentDidMount(): void {
    if(!this.props.create){
      const userObject = this.state.userObject;
      const user = this.props.user;

      Object.keys(user).forEach( key => {
        userObject[key] = user[key];
      });

      this.initializeExtras(userObject)

      this.setState({ userObject });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<RouteComponentProps<{ tag: string }>>): void {
    if(!this.props.create){
      const userObject = this.state.userObject;
      const user = nextProps.user;

      Object.keys(user).forEach( key => {
        userObject[key] = user[key];
      });

      this.initializeExtras(userObject)

      this.setState({ userObject });
    }
   }

  render(): React.Component {
    const {
      userObject,
      create,
      expires,
      confirm,
      confirmValid,
      file,
      filename,
      isFileLoading,
      isRejected,
      limitCN,
      limitSN,
      specifyUser,
      specifyUserValue,
      showAlert,
      alertTitle,
      alertVariant,
      alertBody,
      serialNumber
    } = this.state;
    const date = new Date(userObject.ExpireTime_dt);
    const expDate = date.getTime() == 32400000 ? new Date().toLocaleDateString() : date.toLocaleDateString();
    const dateFormat = date => date.toLocaleDateString();
    const dateParse = date => {
      const split = date.split('/');
      if (split.length !== 3) {
        return new Date();
      }
      const month = split[0];
      const day = split[1];
      const year = split[2];
      return new Date(`${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
    };

    const items = this.groupAuthItems.map( (item) => {
      if(this.state.userObject.AuthType_u32 == item.key){
        return (<SimpleListItem key={item.key} id={item.key} isActive>{item.child}</SimpleListItem>)
      }

      return (<SimpleListItem key={item.key} id={item.key}>{item.child}</SimpleListItem>)
    });

    const saveDisabled = (userObject.AuthType_u32 == 1 && confirmValid == "error") || (userObject.AuthType_u32 == 2 && (isRejected || userObject.UserX_bin == "" || userObject.UserX_bin == undefined ))

    return (
      <React.Fragment>
      <Card>
      <CardBody>
      <Stack hasGutter>
      <StackItem>
      <Flex id="edit" justifyContent={{ default: 'justifyContentSpaceBetween' }}>

      <FlexItem>
      <Form isHorizontal>
      <FormSection>
      <FormGroup label="User Name">
      { !create ?
        <Text><b>{userObject.Name_str}</b></Text>
      :
        <TextInput name="Name_str" value={userObject.Name_str} type="text" onChange={this.handleTextInputChange} aria-label="user name input" />
      }
      </FormGroup>
      <FormGroup label="Full Name">
        <TextInput name="Realname_utf" value={userObject.Realname_utf} type="text" onChange={this.handleTextInputChange} aria-label="full name input" />
      </FormGroup>
      <FormGroup label="Note">
        <TextInput name="Note_utf" value={userObject.Note_utf} type="text" onChange={this.handleTextInputChange} aria-label="note input" />
      </FormGroup>

      <FormGroup>
      </FormGroup>
      <FormGroup label="Group Name">
        <TextInput name="GroupName_str" value={userObject.GroupName_str} type="text" onChange={this.handleTextInputChange} aria-label="group name input" />
      </FormGroup>
      <FormGroup>
        <Checkbox
          label="Set the expiration date"
          isChecked={expires}
          onChange={this.handleExpiresChange}
          aria-label="expires checkbox"
          id="check-expires"
          name="expires"
        />
      </FormGroup>
      <FormGroup label="Expiration Date">
        <DatePicker
          value={expDate}
          onChange={this.handleDateChange}
          dateFormat={dateFormat}
          dateParse={dateParse}
          isDisabled={!expires}
        />
      </FormGroup>
      </FormSection>
      </Form>
      </FlexItem>

      <FlexItem>
        <SimpleList onSelect={this.onAuthSelect} aria-label="Grouped List Example">
          <SimpleListGroup title="Authentication method" id="group-auth">
            {items}
          </SimpleListGroup>
        </SimpleList>
      </FlexItem>

      <FlexItem>
        <Stack hasGutter>
        <StackItem>
        <Checkbox
          label="Set Security Policy"
          isChecked={userObject.UsePolicy_bool}
          onChange={this.handleSetPolicyChange}
          aria-label="policy checkbox"
          id="check-Policy"
          name="UsePolicy_bool"
        />
        </StackItem>
        <StackItem>
        <UserPolicyModal isDisabled={!userObject.UsePolicy_bool} onConfirm={this.handlePolicyChange} user={userObject} />
        </StackItem>
      </Stack>
      </FlexItem>

      </Flex>
      </StackItem>
        {
          userObject.AuthType_u32 == 0 ? "" :
        <StackItem>
        <Divider component="div" />
        </StackItem>}

        {userObject.AuthType_u32 == 1 ?
        <StackItem>
        <Form isHorizontal>
        <FormSection title="Password Authentication Setting" titleElement="h2">
          <FormGroup label="Password">
            <TextInput name="Auth_Password_str" value={userObject.Auth_Password_str} type="password" onChange={this.handlePasswordTextInputChange} aria-label="user password input" />
          </FormGroup>
          <FormGroup label="Confirm" validated={confirmValid} helperTextInvalid="Passwords do not match">
            <TextInput value={confirm} type="password" onChange={this.handlePasswordTextInputChange} aria-label="user password confirmation input" validated={confirmValid}/>
          </FormGroup>
        </FormSection>
        </Form>
        </StackItem>
        :
        userObject.AuthType_u32 == 2 ?
        <React.Fragment>
        <StackItem>
        <TextContent>
        <Text>The users using {"'"}Individual Certificate Authentication{"'"} will be allowed or denied connection deppending on whether the SSL client certificate completely matches the certificate that has been set for the user beforehand.
        </Text>
        </TextContent>
        </StackItem>
        <StackItem>
        <Grid hasGutter>
          <GridItem span={10}>
          <Form>
          <FormGroup validated={isRejected ? 'error' : 'default'} helperTextInvalid="The certificate must be PEM encoded">
            <FileUpload
              id="certificate-file"
              value={file}
              filename={filename}
              onChange={this.handleFileChange}
              onReadStarted={this.handleFileReadStarted}
              onReadFinished={this.handleFileReadFinished}
              isLoading={isFileLoading}
              dropzoneProps={{
                accept: '.crt,.cer,.cert,.pem',
                onDropRejected: this.handleFileRejected
              }}
              validated={isRejected ? 'error' : 'default'}
            />
          </FormGroup>
          </Form>
          </GridItem>
          <GridItem span={2}>
            <ViewCertModal buttonText="View Certificate" certBin={userObject.UserX_bin} isDisabled={isRejected || userObject.UserX_bin == ""}/>
          </GridItem>
        </Grid>
        </StackItem>
        </React.Fragment>
        :
        userObject.AuthType_u32 == 3 ?
        <React.Fragment>
        <StackItem>
          <TextContent>
            <Text>Verification of whether the client certificate is signed is based on a certificate of CA trusted by this Virtual Hub
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Form>
          <FormGroup>
            <Checkbox
              label="Limit Common Name (CN) Value"
              isChecked={limitCN}
              onChange={this.handleSignedCheckboxChange}
              aria-label="cn checkbox"
              id="check-cn"
              name="limitCN"
            />
            <TextInput isDisabled={!limitCN} name="CommonName_utf" value={userObject.CommonName_utf} type="text" onChange={this.handleTextInputChange} aria-label="cn input" />
          </FormGroup>
          <FormGroup helperText="Enter hexadecimal values. (Example: 0155ABCDEF)">
            <Checkbox
              label="Limit Values of the Certificate Serial Number"
              isChecked={limitSN}
              onChange={this.handleSignedCheckboxChange}
              aria-label="sn checkbox"
              id="check-sn"
              name="limitSN"
            />
            <TextInput isDisabled={!limitSN} name="Serial_bin" value={serialNumber} type="text" onChange={this.handleSerialNumberTextInputChange} aria-label="sn input" />
          </FormGroup>
          </Form>
        </StackItem>
        </React.Fragment>
        :
        userObject.AuthType_u32 == 4 || userObject.AuthType_u32 == 5 ?
        <React.Fragment>
        <StackItem>
          <TextContent>
            <Text>
            Login attempts by password will be verified by external RADIUS, Windows NT Domain controller, or Active directory controller.
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Checkbox
            label="Specify User Name on Authentication Server"
            isChecked={specifyUser}
            onChange={this.handleSpecifyUserChange}
            aria-label="specify user checkbox"
            id="check-specify-user"
            name="specifyUser"
          />
        </StackItem>
        <StackItem>
          <TextInput isDisabled={!specifyUser} name="specifyUserValue" value={specifyUserValue} type="text" onChange={this.handleSpecifyUserChange} aria-label="specify user input" />
        </StackItem>
        </React.Fragment>
      : ""}
      </Stack>
      </CardBody>
      <CardFooter>
      <Button isDisabled={saveDisabled} onClick={this.handleEditSaveClick}>Save</Button>
      </CardFooter>
      </Card>
      <ToastAlertGroup title={alertTitle} variant={alertVariant} child={alertBody} add={showAlert} />
      </React.Fragment>
    );
  }
}

export { UserSettings };
