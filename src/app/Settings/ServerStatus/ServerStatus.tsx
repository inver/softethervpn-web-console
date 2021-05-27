import * as React from 'react';
import { PageSection, Title, Stack, StackItem, Button, Flex, FlexItem} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { split_string_by_capitalization } from '@app/utils/string_utils';
import { api } from '@app/utils/vpnrpc_settings';

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

const ServerStatus: React.FunctionComponent = () => (
  <PageSection>
    <ServerStatusTable />
  </PageSection>
);


class ServerStatusTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, columns: ['Item', 'Value'], rows: loading_rows };
  }

  componentDidMount() {
    api.GetServerStatus().then(response => {
      let rows =[];
      Object.keys(response).forEach( key => {
        rows.push([split_string_by_capitalization(key), response[key]])
      })
      this.setState({ loading: false, rows: rows })
    });
  }

  componentDidUpdate(){
    if(this.state.loading){
      api.GetServerStatus().then(response => {
        let rows =[];
        Object.keys(response).forEach( key => {
          rows.push([split_string_by_capitalization(key), response[key]])
        })
        this.setState({ loading: false, rows: rows })
      });
    }
  }

  reloadList = loading => {
    this.setState({ loading: true, rows: loading_rows })
  };


  render() {
    const { loading, columns, rows } = this.state;

    return (
      <React.Fragment>
      <Stack hasGutter>
      <StackItem>
      <Flex>
      <FlexItem>
        <Title headingLevel="h1" size="lg">
          Server Status
        </Title>
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
        <Button variant="secondary" isSmall onClick={() => this.reloadList(loading)}>Refresh</Button>
        </FlexItem>
        </Flex>
        </StackItem>
        <StackItem isFilled>
        <Table
          aria-label="Status Table"
          variant='compact'
          borders='true'
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

export { ServerStatus };
