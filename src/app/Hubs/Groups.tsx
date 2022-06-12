import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Title,
  OverflowMenu,
  OverflowMenuControl,
  OverflowMenuContent,
  OverflowMenuGroup,
  OverflowMenuItem,
  OverflowMenuDropdownItem,
  Dropdown,
  KebabToggle,
  Stack,
  StackItem
} from '@patternfly/react-core';
import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@patternfly/react-table';
import {
  BanIcon
} from '@patternfly/react-icons';
import { GroupSettings } from '@app/Hubs/GroupSettings';
import { DeletionModal } from '@app/DeletionModal';
import { ToastAlertGroup } from '@app/Notifications';
import { GroupInfo } from '@app/Hubs/GroupInfo';
import { GroupMemberList } from '@app/Hubs/GroupMemebersList';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

const emptyTable = (
        <Tr>
          <Td colSpan={8}>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <Title headingLevel="h2" size="lg">
                  No groups found
                </Title>
                <EmptyStateBody>
                  There is not yet any group in this hub.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
            </Td>
        </Tr>
    )

const columnNames = {
  name: "Group Name",
  full: "Full Name",
  desc: "Description",
  num: "Users number"
}

class GroupsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hub: this.props.hub,
      rows: [],
      isEmpty: true,
      selectedRow: "",
      isMenuOpen: false,
      isSelected: false,
      showEdit: false,
      showMemberList: false,
      showStats: false,
      groupObject: new VPN.VpnRpcSetGroup({
        HubName_str: this.props.hub
      }),
      showCreate: false,
      showAlert: false,
      alertTitle: "",
      alertVariant: 'info',
      alertBody: ""
    };

    this.onMenuToggle = isMenuOpen => {
      this.setState({
        isMenuOpen
      });
    };
    this.onMenuSelect = () => {
      this.setState({
        isMenuOpen: !this.state.isMenuOpen
      });
    };

    this.toggleEdit = () => {
      this.setState({ showEdit: !this.state.showEdit, showMemberList: false, showStats: false });
      if(!this.state.showEdit){
        setTimeout(() => {
          const element = document.getElementById("editGroup");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.toggleMemberList = () => {
      this.setState({ showMemberList: !this.state.showMemberList, showEdit: false, showStats: false });
      if(!this.state.showMemberList){
        setTimeout(() => {
          const element = document.getElementById("membersList");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.toggleStats = () => {
      this.setState({ showStats: !this.state.showStats, showEdit: false, showMemberList: false });
      if(!this.state.showStats){
        setTimeout(() => {
          const element = document.getElementById("groupStats");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.hideEdit = () => {
      this.setState({ showEdit: false, showCreate: false })
    };

    this.updateGroups = () => {
      this.loadGroups()
      this.setState({ showEdit: false, showMemberList: false, showStats: false, showCreate: false, selectedRow: "" })
    };

    this.onAlert = this.onAlert.bind(this);
    this.removeGroup = () => {
      const param: VPN.VpnRpcSetGroup = new VPN.VpnRpcSetGroup({
        HubName_str: this.state.groupObject.HubName_str,
        Name_str: this.state.groupObject.Name_str
      });

      api.DeleteGroup(param)
      .then( () => {
        this.loadGroups()
      })
      .catch( error => {
        alert(error)
      });
    };

    this.toggleCreate = () => {
      if(!this.state.showCreate){
        const rows = this.state.rows.map((oneRow) => {
          if(oneRow.selected){
            oneRow.selected = !oneRow.selected
          }
          return oneRow;
        });
        setTimeout(() => {
          const element = document.getElementById("editGroup");
          element.scrollIntoView();
        }, 1);
        this.setState({ rows: rows, groupObject: new VPN.VpnRpcSetGroup({HubName_str: this.props.hub}), isSelected: false, showEdit: false, showMemberList: false, showStats: false })
      }
      this.setState({ showCreate: !this.state.showCreate })
    };
  }

  loadGroups() {
    this.setState({ groupObject: new VPN.VpnRpcSetGroup(), isSelected: false })
    const param: VPN.VpnRpcEnumGroup = new VPN.VpnRpcEnumGroup({
      HubName_str: this.state.hub
    });

    api.EnumGroup(param)
    .then( response => {
      const rows = response.GroupList.map( (group) => {
        return({
          name: group.Name_str,
          full: group.Realname_utf,
          desc: group.Note_utf,
          num: group.NumUsers_u32,
          deny: group.DenyAccess_bool
        })
      });
      this.setState({ isEmpty: response.GroupList.length == 0, rows: rows})
    })
    .catch(error => {
      alert(error)
    });
  }

  loadGroup(groupname: string): void {
    const param: VPN.VpnRpcSetGroup = new VPN.VpnRpcSetGroup({
      HubName_str: this.state.hub,
      Name_str: groupname
    });

    api.GetGroup(param)
    .then( response => {
      this.setState({ groupObject: response })
    })
    .catch( error => console.log(error))
  }

  onAlert(alert: object): void {
    this.setState({
      showAlert: true,
      alertTitle: alert.title,
      alertVariant: alert.variant,
      alertBody: alert.body
    });
    this.setState({ showAlert: false });
  }

  setSelectedRow(rowName: Strings): void {
    this.loadGroup(rowName);
    this.setState({
      selectedRow: rowName,
      isSelected: true
    })
  }

  componentDidMount(): void {
    this.loadGroups()
  }

  render(){
    const {
      hub,
      rows,
      isEmpty,
      selectedRow,
      isMenuOpen,
      isSelected,
      showEdit,
      showMemberList,
      groupObject,
      showCreate,
      showStats,
      showAlert,
      alertTitle,
      alertVariant,
      alertBody
    } = this.state;
    const dropdownItems = [
      <OverflowMenuDropdownItem key="refresh" isShared onClick={this.updateUsers}>Refresh</OverflowMenuDropdownItem>
    ];


     if(isSelected){
       dropdownItems.push(<OverflowMenuDropdownItem key="editGroup" isShared onClick={this.toggleEdit}>{ showEdit ? "Hide Edit" : "Show Edit" }</OverflowMenuDropdownItem>);
       dropdownItems.push(<OverflowMenuDropdownItem key="membersList" isShared onClick={this.toggleMemberList}>{ showMemberList ? "Hide Member List" : "Show Member List" }</OverflowMenuDropdownItem>)
     }

    const modalText = "Are you sure you want to delete the group '" + groupObject.Name_str + "'?";

    return (
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
      <Card>
      <CardHeader>
      <OverflowMenu breakpoint="lg">
        <OverflowMenuContent isPersistent>
          <OverflowMenuGroup groupType="button" isPersistent>
            <OverflowMenuItem isPersistent><Button onClick={this.toggleCreate}>New</Button></OverflowMenuItem>
            <OverflowMenuItem><Button isDisabled={!isSelected} onClick={this.toggleEdit}>{ showEdit ? "Hide Edit" : "Show Edit" }</Button></OverflowMenuItem>
            <OverflowMenuItem><Button isDisabled={!isSelected} onClick={this.toggleMemberList}>{ showMemberList ? "Hide Member List" : "Show Member List" }</Button></OverflowMenuItem>
            <OverflowMenuItem><Button isDisabled={!isSelected} onClick={this.toggleStats}>{ showStats ? "Hide Statistics" : "Show Statistics" }</Button></OverflowMenuItem>
            <OverflowMenuItem isPersistent><DeletionModal isDisabled={!isSelected} buttonText="Remove" modalText={modalText} onConfirm={this.removeGroup} /></OverflowMenuItem>
          </OverflowMenuGroup>
          <OverflowMenuItem><Button variant="secondary" onClick={this.updateGroups}>Refresh</Button></OverflowMenuItem>
        </OverflowMenuContent>
        <OverflowMenuControl>
          <Dropdown
            onSelect={this.onMenuSelect}
            toggle={<KebabToggle onToggle={this.onMenuToggle} />}
            isOpen={isMenuOpen}
            isPlain
            dropdownItems={dropdownItems}
          />
        </OverflowMenuControl>
      </OverflowMenu>
      </CardHeader>
      <CardBody>
      <TableComposable variant='compact'>
      <Thead>
          <Tr>
            <Th />
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.full}</Th>
            <Th>{columnNames.desc}</Th>
            <Th>{columnNames.num}</Th>
          </Tr>
        </Thead>
      <Tbody>
      {isEmpty ?
        emptyTable
        :
        rows.map( (row, rowIndex) => {
          return(
            <Tr key={row.name}>
              <Td
                select={{
                  rowIndex,
                  onSelect: () => this.setSelectedRow(row.name),
                  isSelected: selectedRow === row.name,
                  disable: false,
                  variant: 'radio'
                }}
              />
              <Td dataLabel={columnNames.name}>{row.name} {row.deny ? <BanIcon /> : ""}</Td>
              <Td dataLabel={columnNames.full}>{row.full}</Td>
              <Td dataLabel={columnNames.desc}>{row.desc}</Td>
              <Td dataLabel={columnNames.num}>{row.num}</Td>
            </Tr>
          )
        })
      }
      </Tbody>
      </TableComposable>
      </CardBody>
      </Card>
      </StackItem>
      {
        showEdit ?
        <StackItem>
          <GroupSettings create={false} group={groupObject} updateGroups={this.updateGroups} onAlert={this.onAlert}/>
        </StackItem>
        :
        ""
      }

      {
        showMemberList ?
        <StackItem>
          <GroupMemberList groupName={groupObject.Name_str} hubname={hub}/>
        </StackItem>
        :
        ""
      }

      {
        showCreate ?
        <StackItem>
          <GroupSettings create={true} group={groupObject} updateGroups={this.updateGroups} onAlert={this.onAlert}/>
        </StackItem>
        :
        ""
      }

      {
        showStats ?
        <StackItem>
          <GroupInfo group={groupObject} onRefresh={this.loadGroup.bind(this, groupObject.Name_str)} />
        </StackItem>
        :
        ""
      }
      </Stack>
      <ToastAlertGroup title={alertTitle} group={groupObject} variant={alertVariant} child={alertBody} add={showAlert}/>
      </React.Fragment>
    );
  }
}

export { GroupsList };
