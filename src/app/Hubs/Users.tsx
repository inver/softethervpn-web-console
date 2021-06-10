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
  Table,
  TableHeader,
  TableBody,
  RowSelectVariant
} from '@patternfly/react-table';
import { UserSettings } from '@app/Hubs/UserProperties';
import { UserInfoTable } from '@app/Hubs/UserInfo';
import { DeletionModal } from '@app/DeletionModal';
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

const emptyTable = {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
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
          )
        }
      ],
      disableSelection: true
    }

class UsersList extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      hub: this.props.hub,
      columns: ['User Name', 'Full Name', 'Group Name', 'Description', 'Auth Method', 'Num Logins', 'Last Login', 'Expiration Date', 'Transfer Bytes', 'Transfer Packets'],
      rows: [emptyTable],
      isMenuOpen: false,
      isSelected: false,
      showEdit: false,
      showInfo: false,
      userObject: new VPN.VpnRpcSetUser(),
      showCreate: false
    };
    this.onUserSelect = this.onUserSelect.bind(this);

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
      this.setState({ showEdit: !this.state.showEdit, showInfo: false });
      if(!this.state.showEdit){
        setTimeout(() => {
          const element = document.getElementById("edit");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.toggleInfo = () => {
      this.setState({ showInfo: !this.state.showInfo, showEdit: false });
      if(!this.state.showInfo){
        setTimeout(() => {
          const element = document.getElementById("info");
          element.scrollIntoView();
        }, 1);
      }
    };

    this.hideEdit = () => {
      this.setState({ showEdit: false })
    };

    this.updateUsers = () => {
      this.loadUsers()
      this.setState({ showEdit: false, showInfo: false })
    };

    this.updateCurrentUser = () => {
      this.loadUser(this.state.userObject.Name_str);
    };

    this.toggleCreate = () => {
      if(!this.state.showCreate){
        setTimeout(() => {
          const element = document.getElementById("edit");
          element.scrollIntoView();
        }, 1);
        this.setState({ userObject: new VPN.VpnRpcSetUser(), isSelected: false, showEdit: false, showInfo: false })
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
  }

  onUserSelect(event: Record<string, unknown>, isSelected: boolean, rowId: number): void {
    const rows = this.state.rows.map((oneRow, index) => {
      oneRow.selected = rowId === index;
      if(oneRow.selected){
        this.loadUser(oneRow.cells[0])
      }
      return oneRow;
    });
    this.setState({
        rows: rows,
        isSelected: true
    });
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
          cells: [
            user.Name_str,
            user.Realname_utf,
            user.GroupName_str,
            user.Note_utf,
            numToAuthType(user.AuthType_u32),
            user.NumLogin_u32,
            lastLogin,
            expiration,
            user["Ex.Recv.BroadcastBytes_u64"] + user["Ex.Recv.UnicastBytes_u64"] + user["Ex.Send.BroadcastBytes_u64"] + user["Ex.Send.UnicastBytes_u64"],
            user["Ex.Recv.BroadcastCount_u64"] + user["Ex.Recv.UnicastCount_u64"] + user["Ex.Send.BroadcastCount_u64"] + user["Ex.Send.UnicastCount_u64"]
          ]
        })
    });
      if(response.UserList.length == 0){
        this.setState({ rows: [emptyTable]})
      }
      else{
        this.setState({ rows: rows })
      }
    })
    .catch(error => {
      alert(error)
    })
  }

  loadUser(username: string): void {
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

  componentDidMount(): void {
    this.loadUsers()
  }

  render(): React.Component {
     const {
       hub,
       columns,
       rows,
       isMenuOpen,
       isSelected,
       showEdit,
       showInfo,
       userObject,
       showCreate
     } = this.state;
     const dropdownItems = [
      <OverflowMenuDropdownItem key="refresh" isShared onClick={this.updateUsers}>Refresh</OverflowMenuDropdownItem>
    ];


    if(isSelected){
      dropdownItems.push(<OverflowMenuDropdownItem key="edit" isShared onClick={this.toggleEdit}>{ showEdit ? "Hide Edit" : "Show Edit" }</OverflowMenuDropdownItem>);
      dropdownItems.push(<OverflowMenuDropdownItem key="view" isShared onClick={this.toggleInfo}>{ showInfo ? "Hide User Info" : "Show User Info" }</OverflowMenuDropdownItem>)
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
      <Table
        variant="compact"
        onSelect={rows[0].disableSelection == true ? "" : this.onUserSelect}
        selectVariant={RowSelectVariant.radio}
        aria-label="Users Table"
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
      </CardBody>
      </Card>
      </StackItem>
      {
        showEdit ?
        <StackItem>
          <UserSettings create={false} user={userObject} hideOnConfirmation={this.hideEdit} updateUser={this.updateUsers}/>
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
          <UserSettings create={true} hub={hub} hideOnConfirmation={this.toggleCreate} updateUser={this.updateUsers}/>
        </StackItem>
        :
        ""
      }


      </Stack>
      </React.Fragment>
    );
  }
}

export { UsersList };
