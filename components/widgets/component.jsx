import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import { trackEvent } from 'utils/analytics';

import { Link } from 'react-scroll';

import Loader from 'components/ui/loader';
import NoContent from 'components/ui/no-content';
import Widget from 'components/widget';
import './styles.scss';

class Widgets extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    loadingData: PropTypes.bool,
    loadingMeta: PropTypes.bool,
    widgets: PropTypes.array,
    category: PropTypes.string,
    widgetsData: PropTypes.object,
    simple: PropTypes.bool,
    location: PropTypes.object,
    locationObj: PropTypes.object,
    locationData: PropTypes.object,
    setWidgetsData: PropTypes.func.isRequired,
    setWidgetSettings: PropTypes.func.isRequired,
    setWidgetInteractionByKey: PropTypes.func.isRequired,
    setActiveWidget: PropTypes.func.isRequired,
    setModalMetaSettings: PropTypes.func.isRequired,
    setShareModal: PropTypes.func.isRequired,
    setMapSettings: PropTypes.func.isRequired,
    handleClickWidget: PropTypes.func.isRequired,
    embed: PropTypes.bool,
    modalClosing: PropTypes.bool,
    activeWidget: PropTypes.object,
    noDataMessage: PropTypes.string,
    geostore: PropTypes.object,
    meta: PropTypes.object,
    authenticated: PropTypes.bool,
  };

  render() {
    const {
      activeWidget,
      className,
      widgets,
      category,
      location,
      loadingData,
      loadingMeta,
      setWidgetsData,
      setWidgetSettings,
      setWidgetInteractionByKey,
      setActiveWidget,
      setModalMetaSettings,
      setShareModal,
      embed,
      simple,
      modalClosing,
      noDataMessage,
      geostore,
      meta,
      handleClickWidget,
      authenticated,
    } = this.props;
    const hasWidgets = !isEmpty(widgets);

    // TODO: Pedro: Shouldn't be here, please refactor
    const forestChangeSubCategories = [
      {
        id: 'net-change',
        name: 'Net Forest Change',
      },
      {
        id: 'forest-loss',
        name: 'Forest Loss',
      },
      {
        id: 'forest-gain',
        name: 'Forest Gain',
      },
    ];

    const renderWidgets = (filteredWidgets) => {
      return filteredWidgets.map((w) => (
        <Widget
          key={w.widget}
          {...w}
          large={w.large}
          authenticated={authenticated}
          active={activeWidget && activeWidget.widget === w.widget}
          embed={embed}
          simple={simple}
          location={location}
          geostore={geostore}
          meta={meta}
          metaLoading={loadingMeta || loadingData}
          setWidgetData={(data) => setWidgetsData({ [w.widget]: data })}
          handleSetInteraction={(payload) =>
            setWidgetInteractionByKey({
              key: w.widget,
              payload,
            })}
          handleChangeSettings={(change) => {
            setWidgetSettings({
              widget: w.widget,
              change: {
                ...change,
                ...(change.forestType === 'ifl' &&
                  w.settings &&
                  w.settings.extentYear && {
                    extentYear: w.settings.ifl === '2016' ? 2010 : 2000,
                  }),
                ...(change.forestType === 'primary_forest' &&
                  w.settings &&
                  w.settings.extentYear && {
                    extentYear: 2000,
                  }),
              },
            });
          }}
          handleShowMap={() => {
            setActiveWidget(w.widget);
            trackEvent({
              category: 'Dashboards page',
              action: 'User views a widget on the map',
              label: w.widget,
            });
          }}
          handleShowInfo={setModalMetaSettings}
          handleShowShare={() =>
            setShareModal({
              title: 'Share this widget',
              shareUrl: w.shareUrl,
              embedUrl: w.embedUrl,
              embedSettings: !w.large
                ? { width: 315, height: 460 }
                : { width: 630, height: 460 },
            })}
          preventCloseSettings={modalClosing}
          onClickWidget={handleClickWidget}
        />
      ));
    };

    return (
      <div
        className={cx(
          'c-widgets',
          className,
          { simple },
          { embed },
          { 'no-widgets': !hasWidgets }
        )}
      >
        {loadingData && <Loader className="widgets-loader large" />}

        {category === 'forest-change' && (
          <ul className="c-widgets-subcategory-buttons">
            {forestChangeSubCategories.map((sc) => (
              <li>
                <Link
                  href={`${window.location.href}&scrollTo=${sc.id}`}
                  className="c-widgets-subcategory-button"
                  to={sc.id}
                  smooth
                  duration={300}
                  offset={-18}
                >
                  {sc.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {category === 'forest-change' &&
          !loadingData &&
          widgets &&
          forestChangeSubCategories.map((sc) => (
            <div
              id={sc.id}
              className={cx(
                'c-widgets',
                className,
                { simple },
                { embed },
                { 'no-widgets': !hasWidgets }
              )}
            >
              <div className="c-widgets-subcategory-title">{sc.name}</div>
              {renderWidgets(widgets.filter((w) => w.subCategory === sc.id))}
            </div>
          ))}
        {!loadingData &&
          widgets &&
          category !== 'forest-change' &&
          renderWidgets(widgets)}
        {!loadingData && !hasWidgets && !simple && (
          <NoContent
            className="no-widgets-message large"
            message={noDataMessage}
            icon
          />
        )}
      </div>
    );
  }
}

export default Widgets;
