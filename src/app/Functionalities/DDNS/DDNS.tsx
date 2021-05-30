import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  Text,
  TextContent,
  Title,
  Divider,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Button,
  Flex,
  FlexItem,
  Tooltip,
  Form,
  FormGroup,
  ActionGroup,
  TextInput,
  Radio,
  NumberInput,
  Spinner,
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { ddnsProxy } from '@app/index';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

function errorTrunctate(string: string): string
{
  let out = "";
  for(let i=0; i<string.length; i++)
  {
    if(string[i] == "."){
      break;
    }
    out = out.concat(string[i]);
  }
  return out;
}

function isCorrect(string: string): boolean
{
  for(let i = 0; i<string.length; i++){
    const num = string.charCodeAt(i)
    if(( num < 48 || num > 57) && (num < 65 || num > 90) && (num < 97 || num > 122) && num != 45){
      return false;
    }
  }
  return true;
}

const DynDNS: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <TextContent>
    <Title headingLevel="h1" size="lg">Dynamic DNS</Title>
    <Text component="h5">
    This VPN Server has a Built-in Dynamic DNS Function.
    </Text>
    <Text component="p">
    The Dynamic DNS assigns a unique and permanent DNS hostname for this VPN Server. You can use that hostname to specify this VPN Server on the settings for VPN Client and VPN Bridge. You need not to register and keep a domain name.
    <br/><br/>
    Also, if your ISP assigns you a dynamic (not-fixed) IP address, the corresponding IP addrress of your Dynamic DNS hostname will be automatically changed. It enables you to keep running the VPN Server by using only a dynamic IP address.
    <br/><br/>
    Therefore, you need not any longer to keep static global IP addrresses with expenses monthly costs.
    Moreover, this VPN Server version supports &ldquo;NAT-Trasversal&rdquo; function. If the VPN Server is inside the NAT and is assigned only a private IP address, you can connect to that VPN Server from the Internet side without any special settings on the NAT beforehand.
    </Text>
  </TextContent>
  </PageSection>
  <Divider component="div" />
  <PageSection>
  <DynDNSManagement/>
  </PageSection>
  </React.Fragment>
);

class DynDNSManagement extends React.Component {
  constructor(props){
    super(props);

    this.minValue = 1;
    this.maxValue = 65535;

    this.state = {
      loading: true,
      saving: true,
      hostname: "",
      fqdn: "",
      ipv4: "",
      ipv6: "",
      ipv4err: 0,
      ipv6err: 0,
      ipv4err_str: "",
      ipv6err_str: "",
      currentProxyType: 0,
      proxyType: 0,
      proxyHost: "",
      proxyPort: 8080,
      proxyUser: "",
      proxyPass: "",
      value: "",
      valid: "default",
      type0: true,
      type1: false,
      type2: false,
    }

    this.onRefreshClick = () => {
      this.setState({ loading: true })
      this.loadDDNS()
    }

    this.handleTextInputChange = value => {
      const valid = (value.length > 2 && isCorrect(value)) ? "default" : "error";
      this.setState({ value: value, valid: valid });
    };

    this.handleRestore = () => {
      this.setState({ value: this.state.hostname })
    };

    this.handleHostnameChange = () => {
      this.setState({ loading: true })
      const param: VPN.VpnRpcTest = new VPN.VpnRpcTest({
        StrValue_str: this.state.value
      });

      api.ChangeDDnsClientHostname(param)
      .then( () => {
        this.loadDDNS()
      })
      .catch( error => {
        alert(error)
      });
    };

    this.handleChange = (_, event) => {
      const types = { type0: false, type1: false, type2: false,  proxyType: Number(event.target.name) }
      const selected = event.target.value;

      types[selected] = true;
      this.setState(types);

    };

    this.handleTextInputChangeHost = proxyHost => {
      this.setState({ proxyHost: proxyHost });
    };

    this.handleTextInputChangeUser = proxyUser => {
      this.setState({ proxyUser: proxyUser });
    };

    this.handleTextInputChangePass = proxyPass => {
      this.setState({ proxyPass: proxyPass });
    };

    this.onMinus = () => {
      this.setState({
        proxyPort: this.state.proxyPort - 1
      });
    };

    this.onChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        proxyPort: newValue > this.maxValue ? this.maxValue : newValue < this.minValue ? this.minValue : newValue
      });
    };

    this.onPlus = () => {
      this.setState({
        proxyPort: this.state.proxyPort + 1
      });
    };

    this.handleSaveClick = () => {
      this.setState({ loading: true, saving: true })
      const param: VPN.VpnInternetSetting = new VPN.VpnInternetSetting({
        ProxyType_u32: this.state.proxyType,
        ProxyHostName_str: this.state.proxyHost,
        ProxyPort_u32: this.state.proxyPort,
        ProxyUsername_str: this.state.proxyUser,
        ProxyPassword_str: this.state.proxyPass
      });

      api.SetDDnsInternetSettng(param)
      .then( () => {
        setTimeout(() => {
          this.loadDDNS()
          this.loadDDNSProxy()
        }, 1000);
      })
      .catch( error => {
        console.log(error)
      })
    };
  }

  loadDDNS(){
    api.GetDDnsClientStatus()
    .then( response => {
      this.setState({
        loading: false,
        hostname: response.CurrentHostName_str,
        fqdn: response.CurrentFqdn_str,
        ipv4: response.CurrentIPv4_str,
        ipv6: response.CurrentIPv6_str,
        ipv4err: response.Err_IPv4_u32,
        ipv6err: response.Err_IPv6_u32,
        ipv4err_str: response.ErrStr_IPv4_utf,
        ipv6err_str: response.ErrStr_IPv6_utf,
        value: response.CurrentHostName_str,
      });
    })
    .catch( error => {
      console.log(error)
    });
  }

  loadDDNSProxy(){
    api.GetDDnsInternetSettng()
    .then( response => {
      const state = {
        saving: false,
        currentProxyType: response.ProxyType_u32,
        proxyType: response.ProxyType_u32,
        proxyHost: response.ProxyHostName_str,
        proxyPort: response.ProxyPort_u32,
        proxyUser: response.ProxyUsername_str,
        proxyPass: response.ProxyPassword_str,
        type0: false,
        type1: false,
        type2: false
      }

      state["type" + response.ProxyType_u32.toString()] = true;

      this.setState(state);
    })
    .catch( error => {
      console.log(error)
    });
  }

  componentDidMount(){
    this.loadDDNS()
    this.loadDDNSProxy()
  }

  render(){
    const {
      loading,
      saving,
      hostname,
      fqdn,
      ipv4,
      ipv6,
      ipv4err,
      ipv6err,
      ipv4err_str,
      ipv6err_str,
      currentProxyType,
      proxyType,
      proxyHost,
      proxyPort,
      proxyUser,
      proxyPass,
      value,
      valid,
      type0,
      type1,
      type2,
    } = this.state;

    const isSetDisabled = value == hostname;
    const isRestoreDisabled = isSetDisabled;
    const isProxyDisabled = currentProxyType == 0;

    return(
      <React.Fragment>
      <Grid hasGutter sm={10} md={8} lg={5} xl2={4}>
      <GridItem>
        <Card isFullHeight>
        <CardBody>
        <Title headingLevel="h2" size="sm">Assigned Dynamic DNS Hostname</Title>
            { loading ? <Spinner size="sm" /> :
            <React.Fragment>
            <Text>{fqdn} <Tooltip
              position="auto"
              isContentLeftAligned={true}
              content=
              {
                <p>
                The Dynamic DNS hostname: {fqdn}
                <br/><br/>
                You can access to the below IP address by specifying the above DNS hostname.
                <br/><br/>
                IPv4 Address: {ipv4 == "" ? "(None)" : ipv4}
                <br/>
                IPv6 Address: {ipv6 == "" ? "(None)" : ipv6}
                <br/><br/>
                You can also specify the following special forms of hostnames to specify IPv4 or IPv6 as the address-type explicitly.
                <br/><br/>
                Hostname for IPv4: {hostname}.v4.softether.net
                <br/>
                Hostname for IPv6: {hostname}.v6.softether.net
                </p>
              }
            >
              <span aria-label="DDNS details" tabIndex="0">
                <OutlinedQuestionCircleIcon />
              </span>
            </Tooltip></Text>
            </React.Fragment>}
            <br/>
            <Title headingLevel="h2" size="sm">Global IPv4 Address</Title>
            { loading ? <Spinner size="sm" /> :
            <React.Fragment>
            <Text>{ipv4err == 0 ? ipv4 : errorTrunctate(ipv4err_str) }</Text>
            </React.Fragment> }
            <br/>
            <Title headingLevel="h2" size="sm">Global IPv4 Address</Title>
            { loading ? <Spinner size="sm" /> :
            <React.Fragment>
            <Text>{ipv6err == 0 ? ipv6 : errorTrunctate(ipv6err_str) }</Text>
            </React.Fragment>}
        </CardBody>
        <CardFooter>
          <Button isLoading={loading} onClick={this.onRefreshClick}>Refresh</Button>
        </CardFooter>
        </Card>
      </GridItem>
      <GridItem>
      <Card isFullHeight>
      <CardTitle>Change the Dynamic DNS Hostname</CardTitle>
      <CardBody>
      <Flex>
      <FlexItem>
        <Form>
          <FormGroup
          validated={valid}
          helperTextInvalid="At least three characters. Letters, numbers and dashes only"
          >
            <TextInput
            value={value}
            type="text"
            onChange={this.handleTextInputChange}
            aria-label="ddns host input"
            validated={valid}
            isDisabled={!isProxyDisabled}
            />
          </FormGroup>
        </Form>
        </FlexItem>
        <FlexItem>
          .softether.net
        </FlexItem>
      </Flex>
      </CardBody>
      <CardFooter>
        <Form>
        <ActionGroup>
          <Button isDisabled={isSetDisabled || !isProxyDisabled} onClick={this.handleHostnameChange}>Set Hostname</Button>
          <Button isDisabled={isRestoreDisabled || !isProxyDisabled} onClick={this.handleRestore}>Restore</Button>
        </ActionGroup>
        </Form>
      </CardFooter>
      </Card>
      </GridItem>
      { ddnsProxy ?
      <React.Fragment>
      <GridItem>
      <Card isFullHeight>
      <CardBody>
        <Form isHorizontal>
        <FormGroup label="Proxy Type">
        <Radio
          isChecked={type0}
          name="0"
          onChange={this.handleChange}
          label="Direct TCP/IP Connection (No Proxy)"
          id="direct"
          value="type0"
        />
        <Radio
          isChecked={type1}
          name="1"
          onChange={this.handleChange}
          label="Connect via HTTP Proxy Server"
          id="http"
          value="type1"
        />
        <Radio
          isChecked={type2}
          name="2"
          onChange={this.handleChange}
          label="Connect via SOCKS Proxy Server"
          id="socks"
          value="type2"
        />
        </FormGroup>
        <FormGroup label="Host Name" isRequired>
          <TextInput value={proxyHost} type="text" onChange={this.handleTextInputChangeHost} aria-label="proxyHost" isRequired isDisabled={isProxyDisabled && proxyType == 0}/>
        </FormGroup>
        <FormGroup label="Port" isRequired>
          <NumberInput
            value={proxyPort}
            min={this.minValue}
            max={this.maxValue}
            onMinus={this.onMinus}
            onChange={this.onChange}
            onPlus={this.onPlus}
            inputName="proxy port input"
            inputAriaLabel="proxy port input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            isDisabled={isProxyDisabled && proxyType == 0}
          />
        </FormGroup>
        <FormGroup label="User Name">
          <TextInput value={proxyUser} type="text" onChange={this.handleTextInputChangeUser} aria-label="proxyUser" isDisabled={isProxyDisabled && proxyType == 0}/>
        </FormGroup>
        <FormGroup label="Password">
          <TextInput value={proxyPass} type="password" onChange={this.handleTextInputChangePass} aria-label="proxyPass" isDisabled={isProxyDisabled && proxyType == 0}/>
        </FormGroup>
        <ActionGroup>
          <Button isLoading={saving} isDisabled={proxyHost == ""} onClick={this.handleSaveClick}>Save</Button>
        </ActionGroup>
        </Form>
      </CardBody>
      </Card>
      </GridItem>
      </React.Fragment>
      :
      ""
    }
      </Grid>
      </React.Fragment>
    );
  }
}

export { DynDNS };
