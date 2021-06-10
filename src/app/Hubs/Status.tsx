import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Title,
  TextContent,
  EmptyState,
  EmptyStateIcon,
  Spinner,
  PageSection,
  PageSectionVariants,
  Flex,
  FlexItem
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import { split_string_by_capitalization } from '@app/utils/string_utils';

function processed_key(key: string): string
{
  if(key == "SecureNATEnabled_bool"){
    return "SecureNAT";
  }
  let newKey = split_string_by_capitalization(key);
  newKey = newKey.replace("Num ", "");
  newKey = newKey.replace("Online", "Status");
  newKey = newKey.replace(" Time", "");
  newKey = newKey.replace("Comm", "Communication");
  newKey = newKey.replace("Created", "Created at");
  newKey = newKey.replace("Bytes", "Total Size");
  newKey = newKey.replace("Count", "Packets");
  newKey = newKey.replace("Recv.", "Incoming");
  newKey = newKey.replace("Send.", "Outgoing");
  return newKey;
}

function processed_value(key: string, value)
{

  if(key.slice(-3) == "_dt"){
    return new Date(value).toLocaleString();
  }

  if(key.slice(-9) == "Bytes_u64"){
    return value.toString() + " bytes";
  }

  if(key.slice(-9) == "Count_u64"){
    return value.toString() + " packets";
  }

  if(key == "Online_bool"){
    return value ? "Online" : "Offline";
  }

  if(key == "HubType_u32"){
    return value == 0 ? "Standalone": value == 1 ? "Static" : "Dynamic";
  }

  if(key == "SecureNATEnabled_bool"){
    return value ? "Enabled" : "Disabled";
  }

  return value;
}

function format_keys_and_values(hubObject: Record<string, unknown>): Record<string, unknown>
{
  const newObject = {};
  Object.keys(hubObject).forEach( key => {
    newObject[processed_key(key)] = processed_value(key, hubObject[key]);
  })

  return newObject;
}

class HubStatus extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = { loading: true, hub: this.props.hub, hubObject: new VPN.VpnRpcHubStatus() };
  }

  loadStatus(): void {
    const param: VPN.VpnRpcHubStatus = new VPN.VpnRpcHubStatus({
      HubName_str: this.state.hub
    });

    api.GetHubStatus(param)
    .then( response => {
      this.setState({ loading: false, hubObject: response });
    })
    .catch( error => {
      alert(error)
    })
  }

  componentDidMount(): void {
    this.loadStatus()
  }

  render(): React.Component {
    const { loading, hubObject } = this.state;
    const formatted_hubObject = format_keys_and_values(hubObject);

    return (
      <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
      <Flex>
      <FlexItem>
        <TextContent>
          <Title headingLevel="h2" size="md">Current Status</Title>
        </TextContent>
        </FlexItem>
        <FlexItem>
        <Button variant="secondary" onClick={() => this.loadStatus()}>Refresh</Button>
        </FlexItem>
      </Flex>
      </PageSection>
      { loading ?
        <PageSection variant={PageSectionVariants.light}>
        <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title size="lg" headingLevel="h4">
          Loading
          </Title>
        </EmptyState>
        </PageSection>
        :
        <PageSection variant={PageSectionVariants.light} className="pf-m-overflow-scroll">
        <DataList isCompact>
        {Object.keys(formatted_hubObject).map( (key) => (
          <DataListItem key={key} aria-labelledby={key}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key={"primary content " + key}>
                    <span id={"item " + key}>{key}</span>
                  </DataListCell>,
                  <DataListCell key={"secondary content" + key}>{formatted_hubObject[key]}</DataListCell>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        ))}
        </DataList>
        </PageSection>

      }
      </React.Fragment>
    );
  }
}

export { HubStatus };
