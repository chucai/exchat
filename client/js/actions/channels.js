import * as types from '../constants/ActionTypes'
import { API_CALL, POST, GET } from '../constants/ApiTypes'
import ExSocket from '../constants/ExSocket'
import { receivedMessage } from './messages'
import Schemas from '../store/schema'

let initChannel = function(name, store, callback) {
  let channel = ExSocket.findChannel(name, callback)
  channel.on('new_message', payload => {
    store.dispatch(receivedMessage(payload))
  })
}

export function createChannel(name) {
  return {
    type: types.CREATE_CHANNEL,
    [API_CALL]: {
      endpoint: '/channels',
      method: POST,
      data: {
        channel: {
          name: name
        }
      },
      schema: Schemas.CHANNEL,
      successCallback: function(response, store) {
        const {result, entities} = response
        let item = entities.channels[result]
        initChannel(item.name, store)
      }
    }
  }
}

export function fetchChannels() {
  return {
    type: types.FETCH_CHANNELS,
    [API_CALL]: {
      endpoint: '/channels',
      method: GET,
      schema: Schemas.CHANNEL_ARRAY,
      successCallback: function(response, store) {
        const {result, entities} = response
        _.forEach(result, (id, i) => {
          console.log(i, id)
          let item = entities.channels[id]
          initChannel(item.name, store, ()=> {
            if (result.length - 1 === i) {
              console.log('INIT CHANNELS DONE')
              store.dispatch(initChannelsDone())
            }
          })
        })
      }
    }
  }
}

export function initChannelsDone() {
  return {
    type: types.INIT_CHANNELS_DONE
  }
}

export function fetchChannelsIfNeeded() {
  return (dispatch, getState) => {
    return dispatch(fetchChannels())
  }
}

export function fetchMessages(channel) {
  return {
    channel,
    type: types.FETCH_MESSAGES,
    [API_CALL]: {
      endpoint: `/channels/${channel}/messages`,
      method: GET,
      schema: Schemas.MESSAGE_ARRAY,
      successCallback: function(response, store) {
      }
    }
  }
}