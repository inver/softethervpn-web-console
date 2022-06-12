import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Bullseye,
  Spinner,
  Form,
  FormGroup,
  Select,
  SelectOption,
  SelectDirection,
  SelectVariant,
  Stack,
  StackItem,
  TextInput,
  NumberInput,
  Grid,
  GridItem,
  Button,
  ActionGroup,
  Flex,
  FlexItem
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

function numToString(num: int): string
{
  let string = "";
  if(num == 0) string = "Disable Syslog Send Function";
  if(num == 1) string = "Send Server Logs by Syslog";
  if(num == 2) string = "Send Server and Virtual Hub Security Logs by Syslog";
  if(num == 3) string = "Send Server, Virtual Hub Security and Packet Logs by Syslog";
  return string;
}

function stringToNum(string: string): number
{
  let num = 0;
  if(string == "Disable Syslog Send Function") num = 0;
  if(string == "Send Server Logs by Syslog") num = 1;
  if(string == "Send Server and Virtual Hub Security Logs by Syslog") num = 2;
  if(string == "Send Server, Virtual Hub Security and Packet Logs by Syslog") num = 3;
  return num;
}

class SyslogCard extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);
    this.options = [
      <SelectOption key={0} value="Disable Syslog Send Function" />,
      <SelectOption key={1} value="Send Server Logs by Syslog" />,
      <SelectOption key={2} value="Send Server and Virtual Hub Security Logs by Syslog" />,
      <SelectOption key={3} value="Send Server, Virtual Hub Security and Packet Logs by Syslog" />,
    ];

    this.minPort = 1;
    this.maxPort = 65535;

    this.state = {
      loading: true,
      isOpen: false,
      selected: "Disable Syslog Send Function",
      hostValue: "",
      portValue: 514,
    }

    this.onToggle = isOpen => {
      this.setState({
        isOpen
      });
    };

    this.onSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        this.setState({
          selected: selection,
          isOpen: false
        });
        // console.log('selected:', selection);
      }
    };

    this.handleTextInputChange = hostValue => {
      this.setState({ hostValue: hostValue });
    };

    this.onMinus = () => {
      this.setState({
        portValue: this.state.portValue - 1
      });
    };

    this.onChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        portValue: newValue > this.maxPort ? this.maxPort : newValue < this.minPort ? this.minPort : newValue
      });
    };

    this.onPlus = () => {
      this.setState({
        portValue: this.state.portValue + 1
      });
    };

    this.onSaveClick = () => {
      this.setState({ loading: true });
      const param: VPN.VpnSyslogSetting = new VPN.VpnSyslogSetting({
        SaveType_u32: stringToNum(this.state.selected),
        Hostname_str: this.state.hostValue,
        Port_u32: this.state.portValue,
      });

      api.SetSysLog(param)
      .then( () => {

        api.GetSysLog({})
        .then( response => {
          const selected = numToString(response.SaveType_u32);

          if(response.Port_u32 != 0){
            this.setState({ loading: false, selected: selected, hostValue: response.Hostname_str, portValue: response.Port_u32 });
          }
          else{
            this.setState({ loading: false, selected: selected, hostValue: response.Hostname_str });
          }

        })
        .catch( error => {
          console.log(error)
        });
      })
      .catch( error => {
        console.log(error)
      });
    };

  }

  componentDidMount() {
    api.GetSysLog({})
    .then( response => {
      const selected = numToString(response.SaveType_u32);

      if(response.Port_u32 != 0){
        this.setState({ loading: false, selected: selected, hostValue: response.Hostname_str, portValue: response.Port_u32 });
      }
      else{
        this.setState({ loading: false, selected: selected, hostValue: response.Hostname_str });
      }

    })
    .catch( error => {
      console.log(error)
    });
  }

  render() {
    const { loading, selected, isOpen, hostValue, portValue } = this.state;

    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>Syslog Send Function</b></CardHeader>
       <CardBody isFilled>
       <Stack hasGutter>
        <StackItem>
          You can transfer the entire VPN Server / Bridge Logs, Virtual Hub Administration Logs,<br/>
          or Virtual Hub Packet Logs by using syslog protocol instead of writing to a local disk.
        </StackItem>
        <StackItem>
        <Form>
          <FormGroup>
          <Select
            variant={SelectVariant.single}
            aria-label="Select Syslog"
            onToggle={this.onToggle}
            onSelect={this.onSelect}
            selections={ loading ? "Loading..." : selected }
            isOpen={isOpen}
            isDisabled={false}
            direction={SelectDirection.down}
          >
            {loading ? <SelectOption key={0} ><Bullseye><Spinner size="sm" /></Bullseye></SelectOption> : this.options}
          </Select>
          </FormGroup>
          <FormGroup label="Syslog Server Host Name">
            <TextInput value={hostValue} type="text" onChange={this.handleHostTextInputChange} aria-label="syslog server host name" isDisabled={loading || selected == "Disable Syslog Send Function"}/>
          </FormGroup>
          <Grid>
          <GridItem span={8}>
          <FormGroup label="Port">
          <NumberInput
            isDisabled={loading || selected == "Disable Syslog Send Function"}
            value={portValue}
            min={this.minPort}
            max={this.maxPort}
            onMinus={this.onMinus}
            onChange={this.onChange}
            onPlus={this.onPlus}
            inputName="portInput"
            inputAriaLabel="port input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
          />
          </FormGroup>
          </GridItem>
          <GridItem span={4}>
          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <FlexItem>
          <ActionGroup>
            <Button isLoading={loading} onClick={this.onSaveClick} isDisabled={loading}>Save</Button>
            </ActionGroup>
            </FlexItem>
          </Flex>
          </GridItem>
          </Grid>
        </Form>
        </StackItem>
        </Stack>
       </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}

export { SyslogCard };
