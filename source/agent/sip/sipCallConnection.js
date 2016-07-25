/*global require, exports, GLOBAL*/
'use strict';
var woogeenSipGateway = require('./sipIn/build/Release/sipIn');
var AudioFrameConstructor = woogeenSipGateway.AudioFrameConstructor;
var VideoFrameConstructor = woogeenSipGateway.VideoFrameConstructor;
var AudioFramePacketizer = woogeenSipGateway.AudioFramePacketizer;
var VideoFramePacketizer = woogeenSipGateway.VideoFramePacketizer;
var path = require('path');
var logger = require('./logger').logger;
var log = logger.getLogger('SipCallConnection');
exports.SipCallConnection = function (spec) {
    var that = {},
        input = true,
        output = true,
        gateway = spec.gateway,
        clientID = spec.clientID,
        audio = spec.audio,
        video = spec.video,
        audioFrameConstructor,
        audioFramePacketizer,
        videoFrameConstructor,
        videoFramePacketizer,
        sip_callConnection;
        sip_callConnection = new woogeenSipGateway.SipCallConnection(gateway, clientID);
        if (audio) {
            // sip->mcu
            audioFrameConstructor = new AudioFrameConstructor(sip_callConnection);
            sip_callConnection.setAudioReceiver(audioFrameConstructor);

            // mcu->sip
            audioFramePacketizer = new AudioFramePacketizer(sip_callConnection);

        }
        if (video) {
            videoFrameConstructor = new VideoFrameConstructor(sip_callConnection);
            sip_callConnection.setVideoReceiver(videoFrameConstructor);

            videoFramePacketizer = new VideoFramePacketizer(sip_callConnection);
        }

    that.close = function (direction) {
        log.debug('SipCallConnection close');
        if (direction.output) {
          //audio && audioFramePacketizer && audioFramePacketizer.close();
          //video && videoFramePacketizer && videoFramePacketizer.close();
          output = false;
        }
        // sip_callConnection && sip_callConnection.close();
        if (direction.input) {
          //audio && audioFrameConstructor && audioFrameConstructor.close();
          //video && videoFrameConstructor && videoFrameConstructor.close();
          input = false;
        }
        if (!(input || output) ) {
          audio && audioFramePacketizer && audioFramePacketizer.close();
          video && videoFramePacketizer && videoFramePacketizer.close();
          audio && audioFrameConstructor && audioFrameConstructor.close();
          video && videoFrameConstructor && videoFrameConstructor.close();
          sip_callConnection && sip_callConnection.close();
          log.debug('Completely close');
        }
    };

    that.addDestination = function (track, dest) {
        if (audio && track === 'audio') {
            audioFrameConstructor.addDestination(dest);
            return;
        } else if (video && track === 'video') {
            videoFrameConstructor.addDestination(dest);
            return;
        }

        log.warn('Wrong track:'+track);
    };

    that.removeDestination = function (track, dest) {
        if (audio && track === 'audio') {
            audioFrameConstructor.removeDestination(dest);
            return;
        } else if (video && track === 'video') {
            videoFrameConstructor.removeDestination(dest);
            return;
        }

        log.warn('Wrong track:'+track);
    };

    that.receiver = function (track) {
        if (audio && track === 'audio') {
            return audioFramePacketizer;
        }

        if (video && track === 'video') {
            return videoFramePacketizer;
        }

        log.error('receiver error');
        return undefined;
    };

    that.requestKeyFrame = function() {
        if (video)
            videoFrameConstructor.requestKeyFrame();
    }
    return that;
};