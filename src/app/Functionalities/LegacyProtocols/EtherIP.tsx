import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Divider,
  Text,
  TextContent,
  Title,
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  ActionGroup,
  Button,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Modal,
  ModalVariant,
  Alert,
  Stack,
  StackItem,
  TextInput,
  Select,
  SelectVariant,
  SelectOption
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody, RowSelectVariant } from '@patternfly/react-table';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

const emptyTable = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <Title headingLevel="h2" size="lg">
                  No settings were defined
                </Title>
                <EmptyStateBody>
                Currently there are no settings. You create settings by clicking the button below.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          )
        }
      ],
      disableSelection: true
    };

const EtherIPDetailed: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <TextContent>
    <Title headingLevel="h1" size="lg">EtherIP / L2TPv3 Server Detailed Settings</Title>
    <Text component="p">
      EtherIP / L2TPv3 over IPsec compatible routers can connect to Virtual Hubs on VPN Server and establish Layer-2 (Etherne) Bridge. For instance, Cisco routers, NEC IX series and IIJ SEIL routers are recommended as compatible VPN routers.
      <br/><br/>
      In order to accept EtherIP / L2TPv3 protocol, define appropriate EtherIP / L2TPv3 Client Settings to identify the client site of the router beforehand. An EtherIP / L2TPv3 Client Setting must have a corresponding IPsec Phase 1 ID.
    </Text>
  </TextContent>
  </PageSection>
  <Divider component="div" />
  <PageSection>
    <IPSecPhase1/>
  </PageSection>
  </React.Fragment>
)

class IPSecPhase1 extends React.Component {
  constructor(props){
    super(props);
    this.columns = ['ISAKMP Phase 1 ID', 'Virtual Hub Name', 'User Name'];
    this.state = {
      rows: [emptyTable],
      selected: null,
      isModalOpen: false,
      modalID: "",
      modalHub: null,
      modalUser: "",
      modalPass: "",
      isHubOpen: false
    };

    this.hubOptions = [];

    this.onHubToggle = isHubOpen => {
      this.setState({
        isHubOpen
      });
    };

    this.onHubSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        this.setState({
          modalHub: selection,
          isHubOpen: false
        });
      }
    };

    this.clearSelection = () => {
      this.setState({
        modalHub: null,
        isHubOpen: false
      });
    };

    this.handleIDTextInputChange = modalID => {
      this.setState({ modalID });
    };

    this.handleUserTextInputChange = modalUser => {
      this.setState({ modalUser });
    };

    this.handlePassTextInputChange = modalPass => {
      this.setState({ modalPass });
    };

    this.onSelect = this.onSelect.bind(this);

    this.goBack = () => {
      window.location = window.location.toString().replace("/etherip", "");
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.onAddClick = () => {
      const hub = this.hubOptions[0].props.value;
      console.log(hub)

      this.setState({
        isModalOpen: true,
        modalID: "",
        modalHub: hub,
        modalUser: "",
        modalPass: "",
      })
    };

    this.onEditClick = () => {
      const param: VPN.VpnEtherIpId = new VPN.VpnEtherIpId({
        Id_str: this.state.selected
      });

      api.GetEtherIpId(param)
      .then( response => {
        this.setState({
          isModalOpen: true,
          modalID: response.Id_str,
          modalHub: response.HubName_str,
          modalUser: response.UserName_str,
          modalPass: response.Password_str
        })
      })
      .catch( error => {
        alert(error)
      });
    };

    this.onDelClick = () => {
      const param: VPN.VpnEtherIpId = new VPN.VpnEtherIpId({
        Id_str: this.state.selected
      });

      api.DeleteEtherIpId(param)
      .then( () => {
        this.loadTable()
      })
      .catch( error => {
        alert(error)
      });
    };

    this.onConfirmClick = () => {
      const param: VPN.VpnEtherIpId = new VPN.VpnEtherIpId({
        Id_str: this.state.modalID,
        HubName_str: this.state.modalHub,
        UserName_str: this.state.modalUser,
        Password_str: this.state.modalPass
      });

      api.AddEtherIpId(param)
      .then( () => {
        this.setState({
          isModalOpen: false,
          selected: null
        });

        this.loadTable()
      })
      .catch(error => {
        alert(error)
      });
    };
  }

  onSelect(event, isSelected, rowId) {
    let selected = this.state.selected;
    const rows = this.state.rows.map((oneRow, index) => {
      oneRow.selected = rowId === index;
      if(oneRow.selected){
        selected = oneRow.cells[0];
      }
      return oneRow;
    });
    this.setState({
      rows: rows,
      selected: selected
    });
  }

  loadTable(){
    api.EnumEtherIpId()
    .then( response => {
      const rows = response.Settings.map( (setting) => (
        { cells: [
          setting.Id_str,
          setting.HubName_str,
          setting.UserName_str
        ]}
      ));

      if(rows.length != 0){
        this.setState({ rows: rows, selected: null })
      }
      else{
        this.setState({ rows: [emptyTable], selected: null })
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
            this.setState({ modalHub: hub.HubName_str })
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

  componentDidMount(){
    this.loadHubs()
    this.loadTable()
  }

  render(){
    const {
      rows,
      selected,
      isModalOpen,
      modalID,
      modalHub,
      modalUser,
      modalPass,
      isHubOpen
    } = this.state;

    return (
      <React.Fragment>
      <Card isFullHeight>
      <CardBody>
      <Table
        onSelect={rows[0].disableSelection ? "" : this.onSelect}
        selectVariant={RowSelectVariant.radio}
        aria-label="IPsec Phase 1 ID Table"
        variant='compact'
        cells={this.columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
      </CardBody>
      <CardFooter>
        <Form>
          <ActionGroup>
            <Button onClick={this.onAddClick}>Add</Button>
            <Button isDisabled={selected == null} onClick={this.onEditClick}>Edit</Button>
            <Button isDisabled={selected == null} onClick={this.onDelClick}>Delete</Button>
            <Button variant="secondary" onClick={this.goBack}>Back</Button>
          </ActionGroup>
        </Form>
      </CardFooter>
      </Card>
      <Modal
          variant={ModalVariant.medium}
          isOpen={isModalOpen}
          showClose={false}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.onConfirmClick}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
        <Stack hasGutter>
          <StackItem>
            The following Virtual Hub connection settings will be applied only when an EtherIP / L2TPv3 over IPsec Client is attempting to connect this VPN Server with an ISAKMP (IKE) Phase ID which is exactly equal to the value specified below.
          </StackItem>
          <StackItem>
            <Alert variant="info" isInline title="The user must exist on the Virtual Hub">
              Be aware that the username and the password must be the same as the registered on the Virtual Hub. An EtherIP / L2TPv3 Client will be regarded as it connected to the Virtual Hub with the designated user credentials.
            </Alert>
          </StackItem>
          <StackItem>
          <Form isHorizontal>
            <FormGroup label="ISAKMP Phase 1 ID">
              <TextInput value={modalID} type="text" onChange={this.handleIDTextInputChange} aria-label="ISAKMP input" />
            </FormGroup>
            <FormGroup label="Virtual Hub">
              <Select
                variant={SelectVariant.single}
                aria-label="Hub Input"
                onToggle={this.onHubToggle}
                onSelect={this.onHubSelect}
                selections={modalHub}
                isOpen={isHubOpen}
              >
                {this.hubOptions}
              </Select>
            </FormGroup>
            <FormGroup label="Username">
              <TextInput value={modalUser} type="text" onChange={this.handleUserTextInputChange} aria-label="User input" />
            </FormGroup>
            <FormGroup label="Password">
              <TextInput value={modalPass} type="password" onChange={this.handlePassTextInputChange} aria-label="Password input" />
            </FormGroup>
          </Form>
          </StackItem>
        </Stack>
        </Modal>
      </React.Fragment>
    )
  }
}

export { EtherIPDetailed };
