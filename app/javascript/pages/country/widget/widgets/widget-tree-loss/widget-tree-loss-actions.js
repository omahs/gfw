import { createAction } from 'redux-actions';
import { createThunkAction } from 'utils/redux';
import axios from 'axios';

import { getExtent, getLoss } from 'services/forest-data';

const setTreeLossLoading = createAction('setTreeLossLoading');
const setTreeLossData = createAction('setTreeLossData');
const setTreeLossSettings = createAction('setTreeLossSettings');

const getTreeLoss = createThunkAction(
  'getTreeLoss',
  params => (dispatch, state) => {
    if (!state().widgetTreeLoss.loading) {
      dispatch(setTreeLossLoading(true));
      axios
        .all([getLoss(params), getExtent(params)])
        .then(
          axios.spread((loss, extent) => {
            if (loss && loss.data && extent && extent.data) {
              dispatch(
                setTreeLossData({
                  loss: loss.data.data,
                  extent: (loss.data.data && extent.data.data[0].value) || 0
                })
              );
            } else {
              dispatch(setTreeLossLoading(false));
            }
          })
        )
        .catch(error => {
          dispatch(setTreeLossLoading(false));
          console.info(error);
        });
    }
  }
);

export default {
  setTreeLossData,
  setTreeLossSettings,
  setTreeLossLoading,
  getTreeLoss
};
