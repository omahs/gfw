import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

class WidgetCaution extends PureComponent {
  static propTypes = {
    caution: PropTypes.object,
    locationType: PropTypes.string,
  };

  isVisible() {
    const {
      caution: { visible },
      locationType,
    } = this.props;
    if (visible && locationType && visible.includes(locationType)) return true;
    return false;
  }

  render() {
    const {
      caution: { text, link, linkText },
    } = this.props;
    if (this.isVisible() && linkText) {
      const htmlTextArray = text && linkText && text.split(`{${linkText}}`);
      return (
        <div className="c-widget-caution">
          {htmlTextArray[0]}
          <a href={link} target="_self">
            {linkText}
          </a>
          {htmlTextArray[1]}
        </div>
      );
    }
    if (this.isVisible()) {
      return <div className="c-widget-caution">{text}</div>;
    }

    return null;
  }
}

export default WidgetCaution;
