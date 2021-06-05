import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
} from '@patternfly/react-table';
import {
  Title,
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Button,
  Flex,
  FlexItem,
  Bullseye,
  Spinner,
  Modal,
  ModalVariant
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { split_string_by_capitalization } from '@app/utils/string_utils';

const loading_rows = [
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

const ConnectionsList: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.default}>
  <Stack hasGutter>
    <StackItem>
      <Title headingLevel="h1" size="lg">
        List of TCP / IP Connections
      </Title>
    </StackItem>
    <ConnectionsTable />
    </Stack>
  </PageSection>
);

class ConnectionsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      columns: [
        'Connection Name',
        'Connection Source',
        'Connection Start',
        'Ip',
        'Type'
      ],
      rows: loading_rows,
      canSelectAll: true,
      numSelected: 0,
      isModalOpen: false,
      conn_cols: [ 'Item', 'Value' ],
      conn_rows: loading_rows
    };
    this.reload = () => { this.setState({ loading: true, numSelected: 0 })};
    this.onSelect = this.onSelect.bind(this);
    this.toggleSelect = this.toggleSelect.bind(this);
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
      this.reload();
    };
  }

  loadConnections(){
    api.EnumConnection().then(response => {
      const rows = response.ConnectionList.map((element) => {
        const row = { cells: [
          element.Name_str,
          element.Hostname_str + ': ' + element.Port_u32.toString(),
          element.ConnectedTime_dt,
          element.Ip_ip.toString(),
          element.Type_u32,
        ] };
        return (row);
      });

      this.setState({ rows: rows, loading: false });
    });
  }

  componentDidMount(){
    this.loadConnections()
  }

  componentDidUpdate(){
    if(this.state.loading){
      this.loadConnections()
    }
  }

  onSelect(event, isSelected, rowId) {
    let rows;
    if (rowId === -1) {
      rows = this.state.rows.map(oneRow => {
        oneRow.selected = isSelected;
        return oneRow;
      });
    } else {
      rows = [...this.state.rows];
      rows[rowId].selected = isSelected;
    }
    let num = 0
    rows.forEach(row => {
      if(row.selected){
        num ++;
      }
    });
    this.setState({
      rows
    });
    this.setState({
      numSelected: num
    });
  }

  toggleSelect(checked) {
    this.setState({
      canSelectAll: checked,
    });
  }


  disconnectSelections = rows => {
    rows.forEach(row => {
      if(row.selected){
        const param: VPN.VpnRpcConnectionInfo = new VPN.VpnRpcConnectionInfo(
          {
              Name_str: row.cells[0],
          });
        api.DisconnectConnection(param).then( () => {
          this.setState({ loading: true, numSelected: 0});
        }).catch(error => {
          console.log(error)
        });
      }
    });
  }

  renderConnection = (rows) => {
    let name = ''
    for( let i = 0; i < rows.length; i++){
      if( rows[i].selected ){
        name = rows[i].cells[0];
        break;
      }
    }

    const param: VPN.VpnRpcConnectionInfo = new VPN.VpnRpcConnectionInfo(
      {
          Name_str: name,
      });

    const conn_rows = [];
    api.GetConnectionInfo(param).then(response => {
      Object.keys(response).forEach(key => {
        conn_rows.push([split_string_by_capitalization(key), response[key]])
      });
      this.setState({ conn_rows: conn_rows });
      this.handleModalToggle()
    })
    .catch(error => {
      console.log(error)
    });
  }

  render() {
    const { columns, rows, canSelectAll, loading, numSelected, isModalOpen, conn_cols, conn_rows } = this.state;

    return (
      <React.Fragment>
      <StackItem isFilled>
      <Table
        onSelect={this.onSelect}
        canSelectAll={canSelectAll}
        aria-label="Connections Table"
        variant="compact"
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
      </StackItem>
      <StackItem>
      <Flex>
        <FlexItem><Button isDisabled={numSelected != 1} onClick={() => this.renderConnection(rows)}>Show Connection Informations</Button></FlexItem>
        <FlexItem><Button variant="danger" isDisabled={numSelected == 0} onClick={() => this.disconnectSelections(rows)}>Disconnect</Button></FlexItem>
        <FlexItem align={{ default: 'alignRight' }}><Button variant="secondary" isLoading={loading} onClick={this.reload}>Refresh</Button></FlexItem>
      </Flex>
      </StackItem>
      <Modal
        variant={ModalVariant.medium}
        title={"Connection Informations"}
        isOpen={isModalOpen}
        onClose={this.handleModalToggle}
        actions={
          <Button variant="secondary" onClick={this.handleModalToggle}>
            Exit
          </Button>
        }
      >
      <Table
      aria-label="Connection Table"
      variant="compact"
      cells={conn_cols}
      rows={conn_rows}
      >
      <TableHeader />
      <TableBody />
      </Table>
      </Modal>
      </React.Fragment>
    );
  }
}

export { ConnectionsList };
