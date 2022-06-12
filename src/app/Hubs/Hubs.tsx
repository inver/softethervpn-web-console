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
  constructor(props){
    super(props);
  }

  render() {
    let hub;
    let mode;
    const url = this.props.location.pathname;
    const urlSplitted = url.split("/");
    if (urlSplitted.shift() == "" && urlSplitted.shift() == "hubs"){
      if (urlSplitted.length > 0){
        hub = urlSplitted[0];
      }
  
      if (urlSplitted.length > 1){
        mode = urlSplitted[1];
      }
    }

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
      <Management hub={hub} /> :
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
