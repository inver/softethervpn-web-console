import * as React from 'react';
import { PageSection, Title, Stack, StackItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { split_string_by_capitalization, mode_to_string } from '@app/utils/string_utils';
import { api } from '@app/utils/vpnrpc_settings';
import { capsListGlobal } from '@app/index';

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

const columns = ['Item', 'Value'];

const About: React.FunctionComponent = () => (
  <PageSection>
  <Stack hasGutter>
  <StackItem>
    <Title headingLevel="h1" size="lg">
      VPN Server Informations
    </Title>
    </StackItem>
    <StackItem isFilled>
    <AboutThisServerTable />
    </StackItem>
    </Stack>
  </PageSection>
);


class AboutThisServerTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      rows: loading_rows
    };
  }

  componentDidMount() {
    let rows = [];
    api.GetServerInfo().then(response => {
      Object.keys(response).forEach( key => {
        let value = response[key];
        if( key == "ServerType_u32" ){
          value = mode_to_string(value);
        }
        rows.push({cells: [split_string_by_capitalization(key), value], props: { colSpan: 8 }})
      });
      
        let tail = []

        capsListGlobal.forEach(cap => {
          let capval = cap.CapsValue_u32;

          if(capval === 1){
            capval = "Yes"
          }

          if(capval === 0){
            capval = "No"
          }

          if(cap.CapsDescrption_utf.slice(0,7) === "Maximum"){

            tail.push({cells: [cap.CapsDescrption_utf, capval], props: { colSpan: 8 }});
          }
          else{
            rows.push({cells: [cap.CapsDescrption_utf, capval], props: { colSpan: 8 }});
          }


        });
        rows = rows.concat(tail);
        this.setState({ loading: false, rows: rows });
    }).catch( error => {
      console.log(error)
    });
  }


  render() {
    const { loading, rows } = this.state;

    return (
      <React.Fragment>
      <Table
        aria-label="About Table"
        variant='compact'
        borders='true'
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
      </React.Fragment>
    );
  }
}

export { About };
