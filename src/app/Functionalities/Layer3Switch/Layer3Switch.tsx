import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Text,
  TextContent,
  Title,
  Divider,
  Alert,
  Card,
  CardBody,
  CardFooter,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Flex,
  FlexItem,
  Form,
  ActionGroup,
  Button
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  RowSelectVariant,
} from '@patternfly/react-table';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { NewSwitchModal } from '@app/Functionalities/Layer3Switch/NewSwitchModal';
import { DeletionModal } from '@app/DeletionModal';
import { NewIfModal } from '@app/Functionalities/Layer3Switch/NewIfModal';
import { NewRouteModal } from '@app/Functionalities/Layer3Switch/NewRouteModal';

const emptyRoutes = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateBody>
                  Select a switch or create a new Routing Table.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          )
        }
      ],
      disableSelection: true
    };

const emptyIfs = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateBody>
                  Select a switch or create a new Virtual Interface.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          )
        }
      ],
      disableSelection: true
    };

const emptyTable = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>

                <Title headingLevel="h2" size="lg">
                  No Virtual Layer 3 Switch is defined
                </Title>
                <EmptyStateBody>
                  A Virtual Layer 3 Switch has not yet been created. You can create one with by clicking on &ldquo;New&rdquo;.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          )
        }
      ],
      disableSelection: true
    };



const Layer3Switch: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <Stack hasGutter>
  <StackItem>
  <TextContent>
    <Title headingLevel="h1" size="lg">Virtual Layer 3 Switch</Title>
    <Text component="p">
    You can define Virtual Layer 3 Switches between two or more Virtual Hubs operating on this VPN Server to achieve routing between different IP networks.
    </Text>
  </TextContent>
  </StackItem>
  <StackItem>
    <Alert variant="warning" isInline title="Cautions about Virtual Layer 3 Switch">
      The Virtual Layer 3 Switch functions are provided for network administrators or people who know a lot about networking and IP routing. If you are using the regular VPN functions, you do not need to use the Virtual Layer 3 Switch functions.
      <br/>
      If the Virtual Layer 3 Switch functions are to be used, the person who configures them must have sufficient knowledge of IP routing.
    </Alert>
  </StackItem>
  </Stack>
  </PageSection>
  <Divider component="div" />
  <PageSection>
    <DefinedVL3SCard />
  </PageSection>
  </React.Fragment>
)

class DefinedVL3SCard extends React.Component {
  constructor(props){
    super(props);

    this.switchesCols = ['Layer 3 Switch Name', 'Running Status', 'Interfaces', 'Routing Tables'];
    this.ifCols = ['IP Address', 'Subnet Mask', 'Virtual Hub Name'];
    this.routeCols = ['Network Address', 'Subnet Mask', 'Gateway Address', 'Metric'];

    this.state = {
      switchesRows: [emptyTable],
      ifList: [emptyIfs],
      routesList: [emptyRoutes],
      selectedSwitch: null,
      isRouteSelected: false,
      isIfSelected: false,
    };

    this.onSelectSwitch = this.onSelectSwitch.bind(this);
    this.onSelectIf = this.onSelectIf.bind(this);
    this.onSelectRoute = this.onSelectRoute.bind(this);

    this.handleStartClick = () => {
      const name = this.state.selectedSwitch.cells[0];
      const param: VPN.VpnRpcL3Sw = new VPN.VpnRpcL3Sw({
        Name_str: name
      });

      api.StartL3Switch(param)
      .then( () => {
        const rows = this.state.switchesRows.map(oneRow => {
          if(oneRow.cells[0] == name){
            oneRow.cells[1] = "Running";
          }
          return oneRow;
        });
        this.setState({ switchesRows: rows })
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleStopClick = () => {
      const name = this.state.selectedSwitch.cells[0];
      const param: VPN.VpnRpcL3Sw = new VPN.VpnRpcL3Sw({
        Name_str: name
      });

      api.StopL3Switch(param)
      .then( () => {
        const rows = this.state.switchesRows.map(oneRow => {
          if(oneRow.cells[0] == name){
            oneRow.cells[1] = "Stopped";
          }
          return oneRow;
        });
        this.setState({ switchesRows: rows })
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleDelIfClick = () => {
      const name = this.state.selectedSwitch.cells[0];
      this.state.ifList.forEach(iF => {
        if(iF.selected){
          const param: VPN.VpnRpcL3If = new VPN.VpnRpcL3If({
            Name_str: name,
            HubName_str: iF.cells[2]
          });

          api.DelL3If(param)
          .then( () => {
            this.loadIfs(name)
            const rows = this.state.switchesRows.map(oneRow => {
              if(oneRow.cells[0] == name){
                oneRow.cells[2] --;
              }
              return oneRow;
            });
            this.setState({ switchesRows: rows, isIfSelected: false });
          })
          .catch( error => {
            console.log(error)
          });
        }
      });
    };

    this.handleDelRouteClick = () => {
      const name = this.state.selectedSwitch.cells[0];
      this.state.routesList.forEach(route => {
        if(route.selected){
          const param: VPN.VpnRpcL3If = new VPN.VpnRpcL3If({
            Name_str: name,
            NetworkAddress_ip: route.cells[0],
            SubnetMask_ip: route.cells[1],
            GatewayAddress_ip: route.cells[2],
            Metric_u32: route.cells[3]
          });

          api.DelL3Table(param)
          .then( () => {
            this.loadRoutesTable(name)
            const rows = this.state.switchesRows.map(oneRow => {
              if(oneRow.cells[0] == name){
                oneRow.cells[3] --;
              }
              return oneRow;
            });
            this.setState({ switchesRows: rows, isRouteSelected: false });
          })
          .catch( error => {
            console.log(error)
          });
        }
      });
    };

    this.handleConfirmClick = () => {
      const param: VPN.VpnRpcL3Sw = new VPN.VpnRpcL3Sw({
        Name_str: this.state.selectedSwitch.cells[0]
      });

      api.DelL3Switch(param)
      .then( () => {
        this.handleSwitchUpdate();
      })
      .catch( error => {
        console.log(error)
      })
    };
  }

  onSelectSwitch(event, isSelected, rowId) {
    let selected = null;
    const rows = this.state.switchesRows.map((oneRow, index) => {
      oneRow.selected = rowId === index;
      if(oneRow.selected){
        selected = oneRow;
        this.loadIfs(selected.cells[0]);
        this.loadRoutesTable(selected.cells[0]);
      }
      return oneRow;
    });
    console.log(selected)
    this.setState({
      switchesRows: rows,
      selectedSwitch: selected,
    });
  }

  onSelectIf(event, isSelected, rowId) {
    let selected = false;
    let rows;
    if (rowId === -1) {
      selected = isSelected;
      rows = this.state.ifList.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.ifList];
      rows[rowId].selected = isSelected;
      rows.map( oneRow => {
        if(oneRow.selected){
          selected = true;
          return;
        }
      });
    }
    this.setState({
      ifList: rows,
      isIfSelected: selected,
    });
  }

  onSelectRoute(event, isSelected, rowId) {
    let selected = false;
    let rows;
    if (rowId === -1) {
      selected = isSelected;
      rows = this.state.routesList.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.routesList];
      rows[rowId].selected = isSelected;
      rows.map( oneRow => {
        if(oneRow.selected){
          selected = true;
          return;
        }
      });
    }
    this.setState({
      routesList: rows,
      isRouteSelected: selected,
    });
  }

  loadSwitches(){
    api.EnumL3Switch()
    .then( response => {
      let rows = [];
      if(response.L3SWList.length > 0){
        response.L3SWList.forEach(l3sw => {
          const row = { cells: [
            l3sw.Name_str,
            l3sw.Online_bool ? "Running" : "Stopped",
            l3sw.NumInterfaces_u32,
            l3sw.NumTables_u32,
          ]};
          rows.push(row);
        });
      }
      else{
        rows = [emptyTable];
      }

      this.setState({ loading: false, switchesRows: rows });
    })
    .catch(error => console.log(error));
  }

  loadIfs(name){
    const param: VPN.VpnRpcL3If = new VPN.VpnRpcL3If({
      Name_str: name
    });

    api.EnumL3If(param)
    .then( response => {
      let rows = [];
      // let hubs = [];
      if(response.L3IFList.length > 0){
        response.L3IFList.forEach( iF => {
          const row = { cells: [
            iF.IpAddress_ip,
            iF.SubnetMask_ip,
            iF.HubName_str
          ]};
          rows.push(row)
          // hubs.push(iF.HubName_str)
        });
      }
      else{
        rows = [emptyIfs];
      }

      this.setState({ ifList: rows });
    })
    .catch(error => console.log(error));
  }

  loadRoutesTable(name){

    const param: VPN.VpnRpcL3Table = new VPN.VpnRpcL3Table({
      Name_str: name
    });

    api.EnumL3Table(param)
    .then( response => {
      let rows = [];
      if(response.L3Table.length > 0){
        response.L3Table.forEach( route => {
          const row = { cells: [
            route.NetworkAddress_ip,
            route.SubnetMask_ip,
            route.GatewayAddress_ip,
            route.Metric_u32
          ]};
          rows.push(row)
        });
      }
      else{
        rows = [emptyRoutes];
      }

      this.setState({ routesList: rows });
    })
    .catch(error => console.log(error));
  }

  handleSwitchUpdate(){
    this.loadSwitches()
    this.setState({
      ifList: [emptyIfs],
      routesList: [emptyRoutes],
      selectedSwitch: null,
      isRouteSelected: false,
      isIfSelected: false
    });
  }

  refreshIfList = () => {
    const name = this.state.selectedSwitch.cells[0];
    this.loadIfs(name);
    const rows = this.state.switchesRows.map(oneRow => {
      if(oneRow.cells[0] == name){
        oneRow.cells[2] ++;
      }
      return oneRow;
    });
    this.setState({ switchesRows: rows })
  }

  refreshRouteList = () => {
    const name = this.state.selectedSwitch.cells[0];
    this.loadRoutesTable(name);
    const rows = this.state.switchesRows.map(oneRow => {
      if(oneRow.cells[0] == name){
        oneRow.cells[3] ++;
      }
      return oneRow;
    });
    this.setState({ switchesRows: rows })
  }

  componentDidMount(){
    this.loadSwitches()
  }

  render(){
    const {
      switchesRows,
      ifList,
      routesList,
      selectedSwitch,
      isRouteSelected,
      isIfSelected,
    } = this.state;

    const isStartDisabled = selectedSwitch == null || selectedSwitch.cells[1] == "Running" || selectedSwitch.cells[2] < 1;
    const isStopDisabled = selectedSwitch == null || selectedSwitch.cells[1] == "Stopped";
    const isDeleteDisabled = selectedSwitch == null;
    let isAddIfDisabled: boolean;
    let isAddRouteDisabled: boolean;
    let isDelIfDisabled: boolean;
    let isDelRouteDisabled: boolean;
    if(selectedSwitch != null){
      isAddIfDisabled = selectedSwitch.cells[1] == "Running";
      isAddRouteDisabled = selectedSwitch.cells[1] == "Running";
      isDelIfDisabled = selectedSwitch.cells[1] == "Running" || !isIfSelected;
      isDelRouteDisabled = selectedSwitch.cells[1] == "Running" || !isRouteSelected;
      const deleteName = selectedSwitch.cells[0];
    }
    else{
      isAddIfDisabled = true;
      isAddRouteDisabled = true;
      isDelIfDisabled = true;
      isDelRouteDisabled = true;
    }

    const deleteText = <Text>This will delete the Virtual Layer 3 Switch &ldquo;{deleteName}&rdquo;.<br/>
    Are you sure?</Text>

    return(
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
      <Card isFullHeight>
      <CardBody>
        <Table
          onSelect={switchesRows[0].disableSelection ? "" : this.onSelectSwitch}
          selectVariant={RowSelectVariant.radio}
          aria-label="Virtual Layer 3 Switches Table"
          variant='compact'
          borders='compactBorderless'
          cells={this.switchesCols}
          rows={switchesRows}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </CardBody>
      <CardFooter>
      <Form>
      <ActionGroup>
      <NewSwitchModal switches={switchesRows.map(row => { return row.cells[0]})} onConfirm={this.handleSwitchUpdate}/>
      <Button isDisabled={isStartDisabled} onClick={this.handleStartClick} >Start</Button>
      <Button isDisabled={isStopDisabled} onClick={this.handleStopClick}>Stop</Button>
      <DeletionModal modalText={deleteText} buttonText="Delete" isDisabled={isDeleteDisabled} onConfirm={this.handleConfirmClick}/>
      </ActionGroup>
      </Form>
      </CardFooter>
      </Card>
      </StackItem>
      <StackItem>
      <Flex fullWidth={{ default: 'fullWidth' }}>
      <FlexItem grow={{ default: 'grow'}}>
      <Card isFullHeight>
      <CardBody>
        <Table
          onSelect={ifList[0].disableSelection ? "" : this.onSelectIf}
          canSelectAll={true}
          selectVariant={RowSelectVariant.checkbox}
          aria-label="Virtual Interfaces Table"
          variant='compact'
          borders='compactBorderless'
          cells={this.ifCols}
          rows={ifList}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </CardBody>
      <CardFooter>
      <Form>
      <ActionGroup>
      {isAddIfDisabled ? <Button isDisabled={true}>New Virtual Interface</Button> : <NewIfModal onConfirm={this.refreshIfList} Switch={selectedSwitch.cells[0]}/> }
      <Button isDisabled={isDelIfDisabled} onClick={this.handleDelIfClick}>Delete Virtual Interface</Button>
      </ActionGroup>
      </Form>
      </CardFooter>
      </Card>
      </FlexItem>
      <FlexItem grow={{ default: 'grow'}}>
      <Card isFullHeight>
      <CardBody>
        <Table
          onSelect={routesList[0].disableSelection ? "" : this.onSelectRoute}
          canSelectAll={true}
          selectVariant={RowSelectVariant.checkbox}
          aria-label="Routing Table Table"
          variant='compact'
          borders='compactBorderless'
          cells={this.routeCols}
          rows={routesList}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </CardBody>
      <CardFooter>
      <Form>
      <ActionGroup>
      {isAddRouteDisabled ? <Button isDisabled={true}>Add Routing Table Entry</Button> : <NewRouteModal onConfirm={this.refreshRouteList} Switch={selectedSwitch.cells[0]}/>}
      <Button isDisabled={isDelRouteDisabled} onClick={this.handleDelRouteClick}>Delete Routing Table Entry</Button>
      </ActionGroup>
      </Form>
      </CardFooter>
      </Card>
      </FlexItem>
      </Flex>
      </StackItem>
      </Stack>
      </React.Fragment>
    );
  }
}

export { Layer3Switch };
