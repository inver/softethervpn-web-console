import React from 'react';
import {
  GalleryItem,
  Card,
  CardHeader,
  CardActions,
  CardBody,
  CardTitle,
  Tooltip,
  Switch,
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownSeparator,
  Text
} from '@patternfly/react-core';
import {
  UserIcon,
  UsersIcon,
  ConnectedIcon,
  MicrochipIcon,
  PficonNetworkRangeIcon,
  CatalogIcon,
  OutlinedCalendarIcon,
  OutlinedCalendarAltIcon,
  ServiceIcon,
  MigrationIcon
} from '@patternfly/react-icons';
import { DeletionModal } from '@app/DeletionModal';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { NewHub } from '@app/Hubs/NewHub';

function nuToType(hubnum: number): string
{
  let type = "Standalone";

  if(hubnum == 1){
    type = "Static";
  }

  if(hubnum == 2){
    type = "Dynamic";
  }

  return type;
}

class HubsGalleryItems extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      hublist: [],
      toggle: {},
      online: {},
      selectedHub: null,
      isDeletionModalOpen: false
    };

    this.onToggle = (isOpen, event) => {
      event.stopPropagation();
      const name = event.target.name;
      const toggle = this.state.toggle;
      Object.keys(toggle).forEach( key => {
        toggle[key] = false;
      })
      toggle[name] = isOpen;

      this.setState({
        toggle: toggle,
        selectedHub: name,
        isDeletionModalOpen: false
      });
    };

    this.onSelect = event => {
      event.stopPropagation();
      const toggle = this.state.toggle;
      Object.keys(toggle).forEach( key => {
        toggle[key] = false;
      })

      this.setState({
        toggle: toggle
      });
    };

    this.handleSwitchChange = (isChecked, event) => {
      const name = event.target.name;
      const param: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub({
        HubName_str: name,
        Online_bool: isChecked
      });

      api.SetHub(param)
      .then(response => {
        const online = this.state.online;
        online[name] = response.Online_bool;
        this.setState({ online: online })
      })
      .catch(error => {
        alert(error)
      });
    };

    this.handleDeletionModalToggle = () => {
      this.setState(({ isDeletionModalOpen }) => ({
        isDeletionModalOpen: !isDeletionModalOpen
      }));
    };

    this.confirmDelete = () => {
      const param: VPN.VpnRpcDeleteHub = new VPN.VpnRpcDeleteHub({
        HubName_str: this.state.selectedHub
      });

      api.DeleteHub(param)
      .then( () => {
        this.setState({ isDeletionModalOpen: false })
        this.loadHubs()
      })
      .catch(error => {
        alert(error)
      });
    };

    this.onNewHubClick = () => {
      console.log("new")
    };

    this.onManagementClick = () => {
      window.location = window.location.toString() + "/" + this.state.selectedHub + "/management";
    };

    this.onStatusClick = () => {
      window.location = window.location.toString() + "/" + this.state.selectedHub + "/status";
    };
  }

  loadHubs(): void {
    api.EnumHub()
    .then( response => {
      const toggle = {};
      const online = {};
      response.HubList.forEach( hub => {
        toggle[hub.HubName_str] = false;
        online[hub.HubName_str] = hub.Online_bool;
      });

      this.setState({ hublist: response.HubList, toggle: toggle, online: online });
    })
    .catch( error => {
      alert(error)
    });
  }

  componentDidMount(): void {
    this.loadHubs()
  }

  render(): React.Fragment {
    const {
      hublist,
      toggle,
      selectedHub,
      online,
      isDeletionModalOpen
    } = this.state;
    const dropdownItems = [
      <DropdownItem key="view" component="button" onClick={this.onStatusClick}>View Status</DropdownItem>,
      <DropdownItem key="manage" component="button" onClick={this.onManagementClick}>Manage</DropdownItem>,
      <DropdownSeparator key="separator" />,
      <DropdownItem key="delete" component="button" onClick={this.handleDeletionModalToggle}>Delete</DropdownItem>,
    ];

    const modalText = <Text>Do you want to delete {selectedHub}?
    <br/><br/>
    If you delete the Virtual Hub, all current sessions will be terminated and new sessions will not be able to start.
    <br/>
    This will also delete all the Hub settings, users, groups, certificates and Cascade Connections.
    <br/><br/>
    Once you deleted the Virtual Hub it cannot be recovered.
    <br/>
    Are you sure you want to delete it?</Text>

    return (
      <React.Fragment>
        {hublist.map( (hub) => (
            <GalleryItem key={hub.HubName_str}>
            <Card id={hub.HubName_str + "_card"} isRounded isHoverable>
            <CardHeader>
            <CardTitle>{hub.HubName_str}
            </CardTitle>
              <CardActions>
              <Switch name={hub.HubName_str} id={"hub-online-" + hub.HubName_str} aria-label="Message when on" isChecked={online[hub.HubName_str]} onChange={this.handleSwitchChange}/>
                <Dropdown
                  onSelect={this.onSelect}
                  toggle={<KebabToggle onToggle={this.onToggle} name={hub.HubName_str}/>}
                  isOpen={toggle[hub.HubName_str]}
                  isPlain
                  dropdownItems={dropdownItems}
                  position={'right'}
                />
              </CardActions>
            </CardHeader>

            <CardBody>
              <b>{nuToType(hub.HubType_u32)}</b>
              <br/>
              <Tooltip content="Users"><UserIcon/></Tooltip> {hub.NumUsers_u32}
              <br/>
              <Tooltip content="Groups"><UsersIcon/></Tooltip> {hub.NumGroups_u32}
              <br/>
              <Tooltip content="Sessions"><ConnectedIcon /></Tooltip> {hub.NumSessions_u32}
              <br/>
              <Tooltip content="Mac Tables"><MicrochipIcon /></Tooltip> {hub.NumMacTables_u32}
              <br/>
              <Tooltip content="IP Tables"><PficonNetworkRangeIcon /></Tooltip> {hub.NumIpTables_u32}
              <br/>
              <Tooltip content="Number of Logins"><CatalogIcon /></Tooltip> {hub.NumLogin_u32}
              <br/>
              <Tooltip content="Last Login"><OutlinedCalendarIcon /></Tooltip> { (new Date(hub.LastLoginTime_dt)).toLocaleString()}
              <br/>
              <Tooltip content="Last Communication"><OutlinedCalendarAltIcon /></Tooltip> { (new Date(hub.LastCommTime_dt)).toLocaleString()}
              <br/>
              <Tooltip content="Transferred Bytes"><ServiceIcon/></Tooltip> {hub["Ex.Recv.BroadcastBytes_u64"] + hub["Ex.Recv.UnicastBytes_u64"] + hub["Ex.Send.BroadcastBytes_u64"] + hub["Ex.Send.UnicastBytes_u64"]}
              <br/>
              <Tooltip content="Transferred Packets"><MigrationIcon/></Tooltip> {hub["Ex.Recv.BroadcastCount_u64"] + hub["Ex.Recv.UnicastCount_u64"] + hub["Ex.Send.BroadcastCount_u64"] + hub["Ex.Send.UnicastCount_u64"]}
            </CardBody>
            </Card>
            </GalleryItem>
          ))}

          <NewHub reload={() => this.loadHubs()}/>
          <DeletionModal modalText={modalText} onConfirm={this.confirmDelete} externalToggle={isDeletionModalOpen}/>
      </React.Fragment>
    );
  }
}

export { HubsGalleryItems };
