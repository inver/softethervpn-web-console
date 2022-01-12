import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell
} from '@patternfly/react-core';

const UserInfoTable: React.FunctionComponent = (props) => (
  <React.Fragment>
  <Card id="infoUser">
  <CardHeader>
    <Button variant="secondary" onClick={() => props.refresh()}>Refresh</Button>
  </CardHeader>
  <CardBody>
  <DataList aria-label="User Info data list" isCompact>
    <DataListItem aria-labelledby="name">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="name-item">User Name</span>
            </DataListCell>,
            <DataListCell key="secondary content">{props.user.Name_str}</DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="created">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="created-item">Created On</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {new Date(props.user.CreatedTime_dt).toLocaleString()}
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="updated">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="updated-item">Updated On</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {new Date(props.user.UpdatedTime_dt).toLocaleString()}
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="out-u-packets">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="oup-item">Outgoing Unicast Packets</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Send.UnicastCount_u64"]} packets
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="out-u-size">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="ous-item">Outgoing Unicast Total Size</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Send.UnicastBytes_u64"]} bytes
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="out-b-packets">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="obp-item">Outgoing Broadcast Packets</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Send.BroadcastCount_u64"]} packets
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="out-b-size">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="obs-item">Outgoing Broadcast Total Size</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Send.BroadcastBytes_u64"]} bytes
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="in-u-packets">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="iup-item">Incoming Unicast Packets</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Recv.UnicastCount_u64"]} packets
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="in-u-size">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="ius-item">Incoming Unicast Total Size</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Recv.UnicastBytes_u64"]} bytes
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="in-b-packets">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="ibp-item">Incoming Broadcast Packets</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Recv.BroadcastCount_u64"]} packets
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="in-b-size">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <span id="ibs-item">Incoming Broadcast Total Size</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user["Recv.BroadcastBytes_u64"]} bytes
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
    <DataListItem aria-labelledby="logins">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary conten">
              <span id="logins-item">Number of Logins</span>
            </DataListCell>,
            <DataListCell key="secondary content">
              {props.user.NumLogin_u32}
            </DataListCell>
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  </DataList>
  </CardBody>
  </Card>
  </React.Fragment>
)

export { UserInfoTable };
