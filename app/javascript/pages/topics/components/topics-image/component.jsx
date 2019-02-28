import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import './styles.scss';
import biodiversity1 from 'pages/topics/assets/biodiversity1.png';
import biodiversity2 from 'pages/topics/assets/biodiversity2.png';
import biodiversity3 from 'pages/topics/assets/biodiversity3.png';
import biodiversity4 from 'pages/topics/assets/biodiversity4.png';

class TopicsImage extends PureComponent {
  render() {
    const imgs = {
      '1x': {
        biodiversity1,
        biodiversity2,
        biodiversity3,
        biodiversity4
      },
      '2x': {
        biodiversity1,
        biodiversity2,
        biodiversity3,
        biodiversity4
      }
    };
    const { url, description } = this.props;
    return (
      <div className="c-topics-image">
        <img
          srcSet={`${imgs['2x'][url]} 2x,
          ${imgs['1x'][url]} 1x`}
          src={`${imgs['1x'][url]} 1x`}
          alt={description}
        />
      </div>
    );
  }
}

TopicsImage.propTypes = {
  url: PropTypes.string.isRequired,
  description: PropTypes.string
};

export default TopicsImage;
