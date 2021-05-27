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
  Form,
  FormGroup,
  ActionGroup,
  Alert,
  Checkbox,
  TextInput,
  Grid,
  GridItem,
  NumberInput,
  Radio,
  Flex,
  FlexItem,
  Button
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class KeepAliveCard extends React.Component {
  constructor(props){
    super(props);

    this.minPort = 1;
    this.maxPort = 65535;

    this.minInterval = 5;

    this.state = {
      loading: true,
      useFunction: false,
      hostValue: "",
      portValue: 80,
      intervalValue: 50,
      tcp: true,
      udp: false,
    }

    this.handleCheckBox = (checked) => {
      this.setState({ useFunction: checked })
    };

    this.handleHostChange = (value) => {
      this.setState({ hostValue: value });
    };

    this.onPortMinus = () => {
      this.setState({
        portValue: this.state.portValue - 1
      });
    };

    this.onPortChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        valportValueue: newValue > this.maxPort ? this.maxPort : newValue < this.minPort ? this.minPort : newValue
      });
    };

    this.onPortPlus = () => {
      this.setState({
        portValue: this.state.portValue + 1
      });
    };

    this.onIntervalMinus = () => {
      this.setState({
        intervalValue: this.state.intervalValue - 1
      });
    };

    this.onIntervalChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        intervalValue: newValue < this.minInterval ? this.minInterval : newValue
      });
    };

    this.onIntervalPlus = () => {
      this.setState({
        intervalValue: this.state.intervalValue + 1
      });
    };

    this.handleRadioChange = (_, event) => {
      const value = event.target.value;
      if(value == "tcp"){
        this.setState({ tcp: true, udp: false });
      }

      if(value == "udp"){
        this.setState({ tcp: false, udp: true });
      }
    };

    this.onSaveClick = () => {
      this.setState({ loading: true });
      let param: VPN.VpnRpcKeep = new VPN.VpnRpcKeep({
        UseKeepConnect_bool: this.state.useFunction,
        KeepConnectHost_str: this.state.hostValue,
        KeepConnectPort_u32: this.state.portValue,
        KeepConnectProtocol_u32: this.state.tcp ? 0 : 1,
        KeepConnectInterval_u32: this.state.intervalValue,
      });

      api.SetKeep(param)
      .then( response => {

        let tcp: boolean;
        let udp: boolean;

        if(response.KeepConnectProtocol_u32 == 0){
          tcp = true;
          udp = false;
        }
        else{
          tcp = false;
          udp = true;
        }

        this.setState({
          loading: false,
          useFunction: response.UseKeepConnect_bool,
          hostValue: response.KeepConnectHost_str,
          portValue: response.KeepConnectPort_u32,
          intervalValue: response.KeepConnectInterval_u32,
          tcp: tcp,
          udp: udp,
        })
      })
      .catch(error => {
        console.log(error)
      });

    };
  }

  componentDidMount(){
    api.GetKeep({})
    .then( response => {

      let tcp: boolean;
      let udp: boolean;

      if(response.KeepConnectProtocol_u32 == 0){
        tcp = true;
        udp = false;
      }
      else{
        tcp = false;
        udp = true;
      }

      this.setState({
        loading: false,
        useFunction: response.UseKeepConnect_bool,
        hostValue: response.KeepConnectHost_str,
        portValue: response.KeepConnectPort_u32,
        intervalValue: response.KeepConnectInterval_u32,
        tcp: tcp,
        udp: udp,
      })
    })
    .catch(error => {
      console.log(error)
    });
  }

  render(){
    const { loading, useFunction, hostValue, portValue, intervalValue, tcp, udp } = this.state;

    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>Keep Alive Internet Connection</b></CardHeader>
       <CardBody isFilled>
       <Stack hasGutter>
       <StackItem>
       For environments where internet connections will automatically<br/>be disconnected when idle, you can keep alive the internet connection<br/>by sending dummy packets to any host on the internet.
       </StackItem>
       <StackItem>
        <Alert variant="info" isInline title="No personal information is sent">
          Packets sent to keep alive the internet connections have random bits.
        </Alert>
       </StackItem>
       <StackItem>
       <Form>
       <FormGroup fieldId="useKeepAlive">
          <Checkbox
            label="Use Keep Alive Internet Connection"
            id="useKeepAlive"
            name="useKeepAlive"
            aria-label="Use Keep Alive Internet Connection"
            isChecked={useFunction}
            onChange={this.handleCheckBox}
          />
        </FormGroup>
        </Form>
        </StackItem>
        <StackItem>
        <Form isHorizontal>
       <FormGroup label="Host Name">
        <TextInput
        value={loading ? "" : hostValue}
        type="text" onChange={this.handleHostChange}
        aria-label="keepalive hostname"
        placeholder={loading ? "Loading..." : ""}
        isDisabled={!useFunction}
        />
       </FormGroup>
       </Form>
       </StackItem>
       <StackItem>
       <Form>
        <Grid>
        <GridItem span={6}>
        <FormGroup label="Port">
          <NumberInput
            value={portValue}
            min={this.minPort}
            max={this.maxPort}
            onMinus={this.onPortMinus}
            onChange={this.onPortChange}
            onPlus={this.onPortPlus}
            inputName="portinput"
            inputAriaLabel="port input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            isDisabled={!useFunction}
          />
        </FormGroup>
        </GridItem>
        <GridItem span={6}>
        <FormGroup label="Send Interval">
          <NumberInput
            value={intervalValue}
            min={this.minInterval}
            onMinus={this.onIntervalMinus}
            onChange={this.onIntervalChange}
            onPlus={this.onIntervalPlus}
            inputName="intervalinput"
            inputAriaLabel="interval input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            unit="seconds"
            isDisabled={!useFunction}
          />
        </FormGroup>
        </GridItem>
       </Grid>
       <Grid>
       <GridItem span={6}>
       <FormGroup>
         <Radio
           isChecked={this.state.tcp}
           name="tcp radio"
           onChange={this.handleRadioChange}
           label="TCP/IP Protocol"
           id="tcp-radio"
           value="tcp"
           isDisabled={!useFunction}
         />
       </FormGroup>
       </GridItem>
       <GridItem span={6}>
       <FormGroup>
         <Radio
           isChecked={this.state.udp}
           name="udp radio"
           onChange={this.handleRadioChange}
           label="UDP/IP Protocol"
           id="udp-radio"
           value="udp"
           isDisabled={!useFunction}
         />
       </FormGroup>
       </GridItem>
       </Grid>
       </Form>
       </StackItem>
       <StackItem>
        <Flex>
        <FlexItem align={{ default: 'alignRight' }}>
        <Button variant="primary" isLoading={loading} isDisabled={loading} onClick={this.onSaveClick}>Save</Button>
        </FlexItem>
        </Flex>
       </StackItem>
       </Stack>
       </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}

export { KeepAliveCard };
