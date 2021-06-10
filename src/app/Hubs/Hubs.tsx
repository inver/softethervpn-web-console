import React from 'react';
import {
  PageSection,
  Gallery
} from '@patternfly/react-core';
import { HubsGalleryItems } from '@app/Hubs/HubsGalleryItems';
import { Properties } from '@app/Hubs/Properties';
import { Management } from '@app/Hubs/Management';
import { HubStatus } from '@app/Hubs/Status';


class Hubs extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);
  }

  render(): void {
    const params = new URLSearchParams(this.props.location.search);
    const hub = params.get('hub');
    const mode = params.get('mode');

    return (
      <React.Fragment>
      { hub == null || mode == null ?
      <PageSection isFilled>
      <Gallery hasGutter>
        <HubsGalleryItems />
      </Gallery>
      </PageSection>
      :
      mode == "management" ?
      <Management hub={hub} params={params}/> :
      mode == "properties" ?
      <Properties hub={hub} /> :
      mode == "status" ?
      <HubStatus hub={hub} /> :
      "error"
      }
      </React.Fragment>
    );
  }
}

export { Hubs };
