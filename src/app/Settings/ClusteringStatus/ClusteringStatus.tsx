import React from 'react';
import {
  Title,
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Bullseye,
  Spinner,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  RowSelectVariant,
} from '@patternfly/react-table';
import { api } from '@app/utils/vpnrpc_settings';
import { split_string_by_capitalization } from '@app/utils/string_utils';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { ViewCertModal } from '@app/CertificateViewer/CertificateViewer';


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

const ClusteringStatus: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.default}>
  <RenderTable />
  </PageSection>
);

class RenderTable extends React.Component {
  constructor(props){
    super(props);

    this.state = { loading: true, mode: null };
  }

  componentDidMount(){
    api.GetFarmSetting()
    .then( response => {
      this.setState({ loading: false, mode: response.ServerType_u32 })
    })
    .catch( error => {
      console.log(error)
      this.setState({ loading: false })
    });
  }

  render(){
    const { loading, mode } = this.state;

    return(
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
      <Title headingLevel="h1" size="lg">Clustering Status</Title>
      </StackItem>
      <StackItem isFilled>
      { loading ? <Bullseye><Spinner size="xl" /></Bullseye> : mode == 1 ? <MemberStatus /> : <ControllerStatus /> }
      </StackItem>
      </Stack>
      </React.Fragment>
    );
  }
}


class MemberStatus extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      columns: [ 'Type', 'Connection Started Time', 'Host Name', 'Point', 'Number of Sessions', 'Number of TCP Connections', 'Number of Operating Hubs', 'Client Connection Licenses', 'Bridge Connection Licenses'],
      rows: loading_rows,
      idList: [],
      isModalOpen: false,
      selectedId: null,
      memberCols: ['Item', 'Value'],
      memberRows: loading_rows,
      isCertificateModalOpen: false,
      selectedCert: null,
    };

    this.onSelect = this.onSelect.bind(this);
    this.refresh = () => {
      this.setState({
        rows: loading_rows,
        selectedId: null,
      });
      this.loadList();
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
      this.modalUpdate()
    };
  }

  modalUpdate(){
    this.setState({ memberRows: loading_rows });
    const param: VPN.VpnRpcFarmInfo = new VPN.VpnRpcFarmInfo({
      Id_u32: this.state.selectedId,
    });

    api.GetFarmInfo(param)
    .then( response => {
      const rows = [];
      let cert = "";
      Object.keys(response).forEach(key => {
        // console.log(typeof response[key])
        if( typeof response[key] == "object" ){
          if (key == "Ports_u32"){
            rows.push(["Number of Public Ports", response[key].length])
            let counter = 1;
            response[key].forEach(port => {
              rows.push(["Public Port #" + counter.toString(), port]);
              counter ++;
            })
          }

          if(key == "HubsList"){
            rows.push(["Number of Hubs", response[key].length])
            let counter = 1;
            response[key].forEach(hub => {
              rows.push(["Hub (" + hub.DynamicHub_bool ? "Dynamic" : "Static" + ") #" + counter.toString(), hub.HubName_str]);
              counter ++;
            });
          }
        }
        else{
          if(key != "ServerCert_bin" && key != "Id_u32"){
            rows.push([split_string_by_capitalization(key), response[key].toString()])
          }

          if(key == "ServerCert_bin"){
            cert = response[key];
          }
        }
      });

      this.setState({ memberRows: rows, selectedCert: cert });
    })
    .catch( error => {
      console.log(error)
    });
  }

  loadList(){
    api.EnumFarmMember()
    .then( response => {
      const rows = response.FarmMemberList.map((member) => {
        const row = [
          member.Controller_bool ? "Controller" : "Member",
          member.ConnectedTime_dt,
          member.Hostname_str,
          member.Point_u32,
          member.NumSessions_u32,
          member.NumTcpConnections_u32,
          member.NumHubs_u32,
          member.AssignedClientLicense_u32,
          member.AssignedBridgeLicense_u32
        ];
        return row;
      });

      const ids = response.FarmMemberList.map((member) => {
        return member.Id_u32;
      });

      this.setState({ loading: false, rows: rows, idList: ids });
    })
    .catch( error => {
      console.log(error);
    });
  }

  componentDidMount(){
    this.loadList();
  }


  onSelect(event, isSelected, rowId) {
    // console.log(this.state.idList)
    let id = null;
    const rows = this.state.rows.map((oneRow, index) => {
      oneRow.selected = rowId === index;
      if(rowId === index){
        id = this.state.idList[index];
      }
      return oneRow;
    });
    this.setState({
      rows: rows,
      selectedId: id
    });
  }

  render(){
    const { loading, columns, rows, isModalOpen, selectedId, memberCols, memberRows, selectedCert } = this.state;

    return (
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
      <Title headingLevel="h2" size="sm">Cluster Member List</Title>
      </StackItem>
      <StackItem isFilled>
      <Table
        onSelect={this.onSelect}
        aria-label="Member Status Table"
        variant='compact'
        selectVariant={RowSelectVariant.radio}
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
      </StackItem>
      <StackItem>
      <Flex>
        <FlexItem>
        <Button onClick={this.handleModalToggle} isDisabled={selectedId == null}>Cluster Member Informations</Button>
        </FlexItem>
        <FlexItem>
        <ViewCertModal buttonText="View Server Certificate" isDisabled={selectedId == null} certBin={selectedCert}/>
        </FlexItem>
        <FlexItem>
        <Button variant='secondary' onClick={this.refresh} isLoading={loading}>Refresh</Button>
        </FlexItem>
      </Flex>
      </StackItem>
      </Stack>
      <Modal
          variant={ModalVariant.medium}
          title="Cluster Member Status"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="close" variant="primary" onClick={this.handleModalToggle}>
              Close
            </Button>,
            <Button key="refresh" variant="secondary" onClick={() => this.modalUpdate()}>
              Refresh
            </Button>
          ]}
        >
        <Table
          aria-label="Cluster Member Status Table"
          variant='compact'
          cells={memberCols}
          rows={memberRows}
        >
          <TableHeader />
          <TableBody />
        </Table>
        </Modal>
        </React.Fragment>
    );
  }
}

class ControllerStatus extends React.Component {
  constructor(props){
    super(props);

    this.state = { loading: true, columns: ['Item', 'Value'], rows: loading_rows };

    this.refresh = () => {
      this.setState({ loading: true, rows: loading_rows })
      this.loadFarmStatus()
    }
  }

  loadFarmStatus(){
    api.GetFarmConnectionStatus()
    .then( response => {
      const rows = []
      Object.keys(response).forEach( key => {
        rows.push([split_string_by_capitalization(key), response[key].toString()]);
      });

      this.setState({ loading: false, rows: rows });
    })
    .catch( error => {
      console.log(error)
    });
  }

  componentDidMount(){
    this.loadFarmStatus()
  }

  render(){
    const { loading, columns, rows } = this.state;

    return(
      <React.Fragment>
      <Stack hasGutter>
        <StackItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
          <Title headingLevel="h2" size="sm">Cluster Controller Status</Title>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary" isSmall onClick={this.refresh} isLoading={loading}>Refresh</Button>
          </FlexItem>
        </Flex>
        </StackItem>
        <StackItem>
        <Table
            aria-label="Controller Status Table"
            variant='compact'
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </StackItem>
      </Stack>
      </React.Fragment>
    );
  }
}

export { ClusteringStatus };
