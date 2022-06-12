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
import { UserSettings } from '@app/Hubs/UserSettings';
import { UserInfoTable } from '@app/Hubs/UserInfo';
import { DeletionModal } from '@app/DeletionModal';
import { ToastAlertGroup } from '@app/Notifications';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

function numToAuthType(num: number): string
{
  return (num == 0 ? "Anonymous authentication" :
  num == 1 ? "Password authentication" :
  num == 2 ? "User certificate authentication" :
  num == 3 ? "Root certificate which is issued by trusted Certificate Authority":
  num == 4 ? "Radius authentication" :
  num == 5 ? "Windows NT authentication":
  "")
}


const emptyTable = (
            <Tr>
              <Td colSpan={12}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <Title headingLevel="h2" size="lg">
                      No users found
                    </Title>
                    <EmptyStateBody>
                      There is not yet any user in this hub. Define users to allow client connections.
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
                </Td>
            </Tr>
);

const columnNames = {
  name: "User Name",
  full: "Full Name",
  group: "Group Name",
  desc: "Description",
  auth: "Auth Method",
  num: "Logins number",
  last: "Last Login",
  exp: "Expiration Date",
  bytes: "Transfer Bytes",
  packets: "Transfer Packets"
}

class UsersList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      hub: this.props.hub,
      rows: [],
      selectedRow: "",
      isEmpty: true,
      isMenuOpen: false,
      isSelected: false,
      showEdit: false,
      showInfo: false,
      userObject: new VPN.VpnRpcSetUser(),
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
      this.setState({ showEdit: !this.state.showEdit, showInfo: false, showCreate: false });
      if(!this.state.showEdit){
        setTimeout(() => {
          const element = document.getElementById("editUser");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.toggleInfo = () => {
      this.setState({ showInfo: !this.state.showInfo, showEdit: false, showCreate: false });
      if(!this.state.showInfo){
        setTimeout(() => {
          const element = document.getElementById("infoUser");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.hideEdit = () => {
      this.setState({ showEdit: false, showCreate: false })
    };

    this.updateUsers = () => {
      this.loadUsers()
      this.setState({ showEdit: false, showInfo: false, showCreate: false })
    };

    this.updateCurrentUser = () => {
      this.loadUser(this.state.userObject.Name_str);
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
          const element = document.getElementById("editUser");
          element.scrollIntoView();
        }, 1);
        this.setState({ rows: rows, userObject: new VPN.VpnRpcSetUser(), isSelected: false, showEdit: false, showInfo: false })
      }
      this.setState({ showCreate: !this.state.showCreate })
    };

    this.removeUser = () => {
      const param: VPN.VpnRpcDeleteUser = new VPN.VpnRpcDeleteUser({
        HubName_str: this.state.userObject.HubName_str,
        Name_str: this.state.userObject.Name_str
      });

      api.DeleteUser(param)
      .then( () => {
        this.loadUsers()
      })
      .catch( error => {
        alert(error)
      });
    };

    this.onAlert = this.onAlert.bind(this);
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

  setSelectedRow(rowName: string): void {
    this.loadUser(rowName);
    this.setState({ selectedRow: rowName, isSelected: true });
  }

  loadUsers(): void {
    this.setState({ userObject: new VPN.VpnRpcSetUser(), isSelected: false })
    const param: VPN.VpnRpcEnumUser = new VPN.VpnRpcEnumUser({
      HubName_str: this.state.hub
    });

    api.EnumUser(param)
    .then( response => {
      const rows  = response.UserList.map( (user) => {
        let expiration = new Date(user.Expires_dt)
        if(expiration.getTime() == 32400000){
          expiration = "No Expiration"
        }
        else{
          expiration = expiration.toLocaleString()
        }

        let lastLogin = new Date(user.LastLoginTime_dt)
        if(lastLogin.getTime() == 32400000){
          lastLogin = "None"
        }
        else{
          lastLogin = lastLogin.toLocaleString()
        }

        return ({
          name: user.Name_str,
          full: user.Realname_utf,
          group: user.GroupName_str,
          desc: user.Note_utf,
          auth: numToAuthType(user.AuthType_u32),
          num: user.NumLogin_u32,
          last: lastLogin,
          exp: expiration,
          bytes: user["Ex.Recv.BroadcastBytes_u64"] + user["Ex.Recv.UnicastBytes_u64"] + user["Ex.Send.BroadcastBytes_u64"] + user["Ex.Send.UnicastBytes_u64"],
          packets: user["Ex.Recv.BroadcastCount_u64"] + user["Ex.Recv.UnicastCount_u64"] + user["Ex.Send.BroadcastCount_u64"] + user["Ex.Send.UnicastCount_u64"],
          deny: user.DenyAccess_bool
          })
    });
    this.setState({ isEmpty: response.UserList.length == 0, rows: rows })
    })
    .catch(error => {
      alert(error)
    })
  }

  loadUser(username: string) {
    const param: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser({
      HubName_str: this.state.hub,
      Name_str: username
    });

    api.GetUser(param)
    .then( response => {
      this.setState({ userObject: response })
    })
    .catch( error => console.log(error))
  }

  componentDidMount() {
    this.loadUsers()
  }

  render() {
     const {
       hub,
       rows,
       selectedRow,
       isEmpty,
       isMenuOpen,
       isSelected,
       showEdit,
       showInfo,
       userObject,
       showCreate,
       showAlert,
       alertTitle,
       alertVariant,
       alertBody
     } = this.state;
     const dropdownItems = [
      <OverflowMenuDropdownItem key="refresh" isShared onClick={this.updateUsers}>Refresh</OverflowMenuDropdownItem>
    ];


    if(isSelected){
      dropdownItems.push(<OverflowMenuDropdownItem key="edit" isShared onClick={this.toggleEdit}>{ showEdit ? "Hide Edit" : "Show Edit" }</OverflowMenuDropdownItem>);
      dropdownItems.push(<OverflowMenuDropdownItem key="info" isShared onClick={this.toggleInfo}>{ showInfo ? "Hide User Info" : "Show User Info" }</OverflowMenuDropdownItem>)
    }

    const modalText = "Are you sure you want to delete the user '" + userObject.Name_str + "'?";

    return(
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
            <OverflowMenuItem><Button isDisabled={!isSelected} onClick={this.toggleInfo}>{ showInfo ? "Hide User Info" : "Show User Info" }</Button></OverflowMenuItem>
            <OverflowMenuItem isPersistent><DeletionModal isDisabled={!isSelected} buttonText="Remove" modalText={modalText} onConfirm={this.removeUser} /></OverflowMenuItem>
          </OverflowMenuGroup>
          <OverflowMenuItem><Button variant="secondary" onClick={this.updateUsers}>Refresh</Button></OverflowMenuItem>
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
          <Th>{columnNames.group}</Th>
          <Th>{columnNames.desc}</Th>
          <Th>{columnNames.auth}</Th>
          <Th>{columnNames.num}</Th>
          <Th>{columnNames.last}</Th>
          <Th>{columnNames.exp}</Th>
          <Th>{columnNames.bytes}</Th>
          <Th>{columnNames.packets}</Th>
        </Tr>
      </Thead>
      <Tbody>
      {
        isEmpty ? emptyTable :
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
              <Td dataLabel={columnNames.group}>{row.group}</Td>
              <Td dataLabel={columnNames.desc}>{row.desc}</Td>
              <Td dataLabel={columnNames.auth}>{row.auth}</Td>
              <Td dataLabel={columnNames.num}>{row.num}</Td>
              <Td dataLabel={columnNames.last}>{row.last}</Td>
              <Td dataLabel={columnNames.exp}>{row.exp}</Td>
              <Td dataLabel={columnNames.bytes}>{row.bytes}</Td>
              <Td dataLabel={columnNames.packets}>{row.packets}</Td>
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
          <UserSettings create={false} hub={hub} user={userObject} updateUser={this.updateUsers}  onAlert={this.onAlert}/>
        </StackItem>
        :
        ""
      }

      {
        showInfo ?
        <StackItem>
          <UserInfoTable refresh={this.updateCurrentUser} user={userObject}/>
        </StackItem>
        :
        ""
      }

      {
        showCreate ?
        <StackItem>
          <UserSettings create={true} hub={hub} updateUser={this.updateUsers} onAlert={this.onAlert}/>
        </StackItem>
        :
        ""
      }


      </Stack>
      <ToastAlertGroup title={alertTitle} variant={alertVariant} child={alertBody} add={showAlert} />
      </React.Fragment>
    );
  }
}

export { UsersList };
