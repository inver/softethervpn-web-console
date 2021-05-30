import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Button,
  Select,
  SelectOption,
  SelectVariant,
  SelectDirection,
  TextInput,
  Radio,
  Divider,
  Card,
  CardTitle,
  CardBody,
  TextContent,
  Title,
  Text,
  Form,
  FormGroup,
  ActionGroup,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Alert,
  Spinner
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
} from '@patternfly/react-table';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { isTapSupported } from '@app/index';

const emptyTable = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>

                <Title headingLevel="h2" size="lg">
                  No local bridge is defined
                </Title>
                <EmptyStateBody>
                  A local bridge has not yet been created. Use the form below to create one.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          )
        }
      ],
      disableSelection: true
    };

    const loadingTable = [
          {
            heightAuto: true,
            cells: [
              {
                props: { colSpan: 8 },
                title: (
                  <Bullseye>
                    <Spinner size="xl" />
                  </Bullseye>
                )
              }
            ]
          }
        ];

const LocalBridge: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <Stack hasGutter>
  <StackItem>
  <TextContent>
    <Title headingLevel="h1" size="lg">Local Bridge Feature</Title>
    <Text component="p">
    Local Bridge can establish a Layer 2 bridge connection between a Virtual Hub on this VPN server and a physical Ethernet Device (Network Adapter).<br/>
        It is also possible to create a tap device (virtual network interface) and establish a bridge connection with a Virtual Hub. (Tap is supported on Linux versions only)
    </Text>
  </TextContent>
  </StackItem>
  <StackItem>
  <Alert variant="info" isInline title="Note">
  Although it is possible to establish a bridge using any operating network adapter, it is advisable to prepare a network adapter dedicated for bridging in high load environments.
  </Alert>
  </StackItem>
  <StackItem>
  <Alert variant="info" isInline title="Missing Network Adapter">
  If a network adapter which has been recently added to the system does not appear, reboot the computer and re-open this page.
  </Alert>
  </StackItem>
  </Stack>
  </PageSection>
  <Divider component="div" />
  <PageSection>
    <LocalBridgeCard />
  </PageSection>
  </React.Fragment>
)

class LocalBridgeCard extends React.Component {
  constructor(props){
    super(props);

    this.adapterOptions = [<SelectOption key={0} value='Loading...' isPlaceholder />];
    this.hubOptions = [<SelectOption key={0} value='Loading...' isPlaceholder />];

    this.state = {
      columns: ['Number', 'Type', 'Virtual Hub Name', 'Network Adapter or Tap Device Name', 'Status'],
      rows: [loadingTable],
      isBridgeDisabled: false,
      isAdapterOpen: false,
      selectedAdapter: null,
      isHubOpen: false,
      selectedHub: null,
      tapname: '',
      adapter: true,
      tap: false,
      isDeleteDisabled: true,
      canSelectAll: false,
    };


    this.onAdapterToggle = isAdapterOpen => {
      this.setState({
        isAdapterOpen: isAdapterOpen
      });
    };

    this.onAdapterSelect = (event, selection) => {
        this.setState({
          selectedAdapter: selection,
          isAdapterOpen: false
        });
    };

    this.onHubToggle = isHubOpen => {
      this.setState({
        isHubOpen: isHubOpen
      });
    };

    this.onHubSelect = (event, selection) => {
        this.setState({
          selectedHub: selection,
          isHubOpen: false
        });
    };

    this.handleTextInputChange = value => {
      this.setState({ tapname: value.slice(0,11) });
    };

    this.handleRadioChange = (_, event) => {
      let adapter: boolean;
      let tap: boolean;
      const target = event.target;
      if (target.value == 0){
        adapter = true;
        tap = false;
      }
      else{
        adapter = false;
        tap = true;
      }
      this.setState({ adapter: adapter, tap: tap });
    };

    this.onSelectBridge = this.onSelectBridge.bind(this);

    this.onDeleteClick = () => {
      let selectedCounter = 0;
      let counter = 0;

      this.state.rows.forEach(row => {
        if(row.selected){
          selectedCounter ++;
        }
      });

      this.state.rows.forEach(row => {
        if(row.selected){
          counter ++;
          const param: VPN.VpnRpcLocalBridge = new VPN.VpnRpcLocalBridge({
            DeviceName_str: row.cells[3],
            HubNameLB_str: row.cells[2]
          });

          api.DeleteLocalBridge(param)
          .then( () => {
            if(selectedCounter == counter){
              this.setState({ loading: true });
            }
          })
          .catch( error => { console.log(error) });
        }
      });
    };

    this.handleCreateClick = () => {
      let name: string;
      if(this.state.adapter){
        name = this.state.selectedAdapter;
      }

      if(this.state.tap){
        name = this.state.tapname;
      }

      const param: VPN.VpnRpcLocalBridge = new VPN.VpnRpcLocalBridge({
        DeviceName_str: name,
        HubNameLB_str: this.state.selectedHub,
        TapMode_bool: this.state.tap
      });

      api.AddLocalBridge(param)
      .then( () => {
        this.setState({ loading: true });
      })
      .catch( error => { console.log(error) });

    };
  }

  loadTable(){
    api.GetBridgeSupport().then( response => {
      const bridge = response.IsBridgeSupportedOs_bool;
      let canSelectAll = false;

      if(bridge){
        api.EnumLocalBridge()
        .then( response => {
          let rows = [];

          if( response.LocalBridgeList.length == 0){
            rows = [emptyTable];
          }
          else{
            canSelectAll = true;
            let number = 1;
            response.LocalBridgeList.forEach(bridge => {
              let mode = "Network Adapter";
              let status = "Error"

              if(bridge.TapMode_bool){
                mode = "Tap"
              }

              if(bridge.Online_bool && bridge.Active_bool){
                status = "Operational"
              }

              const row = { cells: [
                number,
                mode,
                bridge.HubNameLB_str,
                bridge.DeviceName_str,
                status
              ]};
              number ++;
              rows.push(row);
            });
          }

          this.setState({
            loading: false,
            rows: rows,
            canSelectAll: canSelectAll,
            isDeleteDisabled: true,
          });
        })
        .catch( error => {
          console.log(error)
        });
      }
      else{
        this.setState({ loading: false, isBridgeDisabled: true, canSelectAll: canSelectAll });
      }
    })
    .catch( error => {
      console.log(error)
    });
  }

  loadHubs(){
    api.EnumHub()
    .then( response => {
      if( response.HubList.length > 0 ){
        let counter = -1;

        this.hubOptions = response.HubList.map((hub) => {
          if(counter == -1){
            this.setState({ selectedHub: hub.HubName_str })
          }
          counter++;
          return(
            <SelectOption key={counter} value={hub.HubName_str} />
          );

        });
      }
    })
    .catch( error => {
      console.log(error)
    });
  }

  loadAdapters(){
    api.EnumEthernet()
    .then( response => {
      if(response.EthList.length > 0){
        let counter = -1;

        this.adapterOptions = response.EthList.map((eth) => {
          if(counter == -1){
            this.setState({ selectedAdapter: eth.DeviceName_str })
          }
          counter ++;
          return(
            <SelectOption key={counter} value={eth.DeviceName_str} />
          );

        });
      }
    })
    .catch( error => {
      console.log(error)
    });
  }

  onSelectBridge(event, isSelected, rowId) {
    let rows;
    let disabled = true;
    if (rowId === -1) {
      disabled = !isSelected;
      rows = this.state.rows.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.rows];
      rows[rowId].selected = isSelected;
      rows.forEach(row => {
        if(row.selected){
          disabled = false;
          return;
        }
      });
    }
    this.setState({
      rows: rows,
      isDeleteDisabled: disabled
    });
  }


  componentDidMount(){
    this.loadTable()
    this.loadHubs()
    this.loadAdapters()
  }

  componentDidUpdate(){
    if(this.state.loading){
      this.loadTable()
    }
  }



  render(){
    const {
      columns,
      rows,
      isBridgeDisabled,
      isAdapterOpen,
      selectedAdapter,
      isHubOpen,
      selectedHub,
      tapname,
      adapter,
      tap,
      isDeleteDisabled,
      canSelectAll
    } = this.state;

    return (
      <React.Fragment>
      <Card isFullHeight>
      <CardBody>
      <Stack hasGutter>
        <StackItem>
        {canSelectAll ?
        <Table
        aria-label="Bridges table"
        cells={columns}
        rows={rows}
        variant='compact'
        borders='compactBorderless'
        onSelect={this.onSelectBridge}
        canSelectAll={canSelectAll}
        >
          <TableHeader />
          <TableBody />
        </Table> :

        <Table
        aria-label="Bridges table"
        cells={columns}
        rows={rows}
        variant='compact'
        borders='compactBorderless'
        >
          <TableHeader />
          <TableBody />
        </Table>
       }
        </StackItem>
        <StackItem>
          <Button variant="primary" onClick={this.onDeleteClick} isDisabled={isDeleteDisabled}>Delete Selected Bridge(s)</Button>
        </StackItem>
        <StackItem>
          <Card>
          <CardTitle>New Local Bridge</CardTitle>
          <CardBody>
            <Form isHorizontal>
            <FormGroup label="Virtual Hub">
              <Select
                variant={SelectVariant.single}
                aria-label="Select Hub"
                onToggle={this.onHubToggle}
                onSelect={this.onHubSelect}
                selections={selectedHub}
                isOpen={isHubOpen}
                isDisabled={isBridgeDisabled}
                direction={SelectDirection.down}
              >
                {this.hubOptions}
              </Select>
            </FormGroup>
            <Divider component="div" />
            { isTapSupported ?
              <FormGroup label="Type to create">
                <Radio
                id="radio-lan"
                label="Bridge with existing Physical Network Adapter"
                name="adapter-radio"
                isChecked={adapter}
                onChange={this.handleRadioChange}
                value={0}
                isDisabled={isBridgeDisabled}
                />
                <Radio
                id="radio-tap"
                label="Bridge with new Tap Device"
                name="tap-radio"
                isChecked={tap}
                onChange={this.handleRadioChange}
                value={1}
                isDisabled={isBridgeDisabled}
                />
              </FormGroup>
              :
              <div/>
            }

            <FormGroup label="Lan Adapter">
              <Select
                variant={SelectVariant.single}
                aria-label="Select Adapter"
                onToggle={this.onAdapterToggle}
                onSelect={this.onAdapterSelect}
                selections={selectedAdapter}
                isOpen={isAdapterOpen}
                isDisabled={!adapter || isBridgeDisabled}
                direction={SelectDirection.down}
              >
                {this.adapterOptions}
              </Select>
            </FormGroup>
            { isTapSupported ?
              <FormGroup label="New Tap Device Name">
              <Flex>
              <FlexItem>
                <TextInput value={tapname} type="text" onChange={this.handleTextInputChange} aria-label="tap name input" isDisabled={!tap || isBridgeDisabled}/>
                </FlexItem>
                <FlexItem>
                  (Maximum 11 characters)
                </FlexItem>
                </Flex>
              </FormGroup>
              :
              <div/>
            }
            <ActionGroup>
              <Button
              isDisabled={selectedHub == null || (adapter && selectedAdapter == null) || (tap && tapname == "")}
              onClick={this.handleCreateClick}
              >
              Create Local Bridge
              </Button>
            </ActionGroup>
            </Form>
          </CardBody>
          </Card>
        </StackItem>
      </Stack>
      </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}

export { LocalBridge };
