<script lang="ts" setup>
import { defineComponent, getCurrentInstance, reactive, ref, watch } from 'vue';
import { showHttpErrorIfExists } from "@/lib/handleHttpError";
import { serverMethods } from "@/serverMethods";
import { showAlert, showConfirm, showPrompt } from '@/ui-elements/ShowModal/showModal';
import { store } from '@/store';
import { postToPwa, submitListeners, subscribeToEvent, subscribeToEvents, unsubscribeFromAll, unsubscribeFromEventTypes } from "../../lib/postMessageToPwa";
// import phone, phone cancel and silent icons from mdi
import { mdiPhone, mdiClose, mdiVolumeOff } from '@mdi/js';
import { onBeforeUnmount } from 'vue';
import { CallRoom } from '@/serverModels/CallRoom';
// import { CallRoom } from '@/serverModels/CallRoom';
const { uid } = getCurrentInstance()


let localVideo = ref(null);
let remoteVideo = ref(null);
let remoteAudio = ref(null);

class ClientVideoChatData {
    remoteVideoPromises = [];
    connection: RTCPeerConnection = null;
    remoteDescription: RTCSessionDescription = null;
    incomingIceCandidates = [];
    localSdpId = 0;
    localAppliedSdpId = 0;
    remoteSdpId = 0;
    localStream: MediaStream = null;
    localStreamAttachedToConnection = false;
    currentOffers: { [sdpId: string]: RTCSessionDescriptionInit } = {};
    currentAnswer: RTCSessionDescriptionInit;
    uuid?: string;
    callRoom?: CallRoom;
    bufferedIceCandidates? = [];

    constructor() {
        this.uuid = crypto.randomUUID();
    }

    async sendSdpOffer() {
        this.localSdpId += 1;
        this.currentOffers[this.localSdpId] = await this.connection.createOffer();

        let result = await serverMethods.postVideoChatSdpOffer({ callRoomId: store.currentVideoChat?.callRoom?.id, offer: this.currentOffers[this.localSdpId], sdpId: this.localSdpId });
        return result;
    }

    async sendSdpAnswer() {
        this.localSdpId += 1;
        let answer = await currentVideoCall.connection.createAnswer();
        await currentVideoCall.connection.setLocalDescription(answer);
        let result = await serverMethods.postVideoChatSdpAnswer({ answer: answer, callRoomId: store.currentVideoChat.callRoom.id, sdpId: this.localSdpId, remoteSdpId: this.remoteSdpId });
        if (showHttpErrorIfExists(result)) {
            return;
        }
    }

    async trySetRemoteDescription(sdp, targetSdpId, remoteSdpId) {
        console.log("trying to set remote description for sdpId", targetSdpId, "remoteSdpId", remoteSdpId)
        console.log("current sdp id", this.localSdpId, "current remot sdp", this.remoteSdpId)
        if (this.localSdpId == targetSdpId && this.remoteSdpId < remoteSdpId) {
            if (this.currentOffers[this.localSdpId]) {
                console.log(">>>>>>> setting current offer")
                this.connection.setLocalDescription(this.currentOffers[this.localSdpId]);
                delete this.currentOffers[this.localSdpId];
            }
            this.remoteSdpId = remoteSdpId;
            this.remoteDescription = new RTCSessionDescription(sdp);
            console.log("setting remote description")
            this.connection.setRemoteDescription(this.remoteDescription).catch((error) => {
                console.error("error setting remote description in videoChatSdpAnswer")
                showAlert("Error setting remote description in videoChatSdpAnswer: " + error);
            });
            if (!this.localStreamAttachedToConnection) {
                this.attachLocalStreamToConnection();
            }
            if (currentVideoCall.bufferedIceCandidates.length) {
                for (let i = 0; i < currentVideoCall.bufferedIceCandidates.length; ++i) {
                    let data = currentVideoCall.bufferedIceCandidates[i];
                    currentVideoCall.bufferedIceCandidates.splice(i, 1);
                    i--;
                    console.log("trying to add buffered candidate", "this.remote", this.remoteSdpId, "data.sdpid", data.sdpId, "local sdpid", this.localSdpId, "data.remotesdpId", data.remoteSdpId)
                    if (this.localSdpId >= data.remoteSdpId)
                        currentVideoCall.tryAddIceCandidate(data);
                }
            }
        } else {
            console.log(`remote description version incorrect. Got target: ${targetSdpId}, but current is ${this.localSdpId}, got remote: ${remoteSdpId}, but needed greater than: ${this.remoteSdpId}`)
        }
    }

    async tryAddIceCandidate(data) {
        // if (currentVideoCall.localSdpId == data.remoteSdpId) {
        console.log('will add cancdidate')
        const candidate = new RTCIceCandidate(data.candidate);
        currentVideoCall.connection.addIceCandidate(candidate).catch((error) => {
            console.error("Error adding ice candidate", error);
        });
        // } else {
        //     console.log(`will skip candidate bc currentVideoCall.localSdpId=${currentVideoCall.localSdpId} but data.remoteSdpId = ${data.remoteSdpId}`)
        // }
    }

    attachLocalStreamToConnection() {
        this.localStreamAttachedToConnection = true;
        let tracks = this.localStream.getTracks();
        for (let i = 0; i < tracks.length; i++) {
            this.connection.addTrack(tracks[i], this.localStream);
        }
    }

    close() {
        console.log("closing connection...")
        this.remoteDescription = null;
        this.incomingIceCandidates = [];
        this.localStreamAttachedToConnection = false;
        this.localSdpId = 0;
        this.remoteSdpId = 0;
        this.currentAnswer = null;
        this.currentOffers = {};
        this.bufferedIceCandidates = [];
        if (this.connection) {
            this.connection.ontrack = null;
            // @ts-ignore
            this.connection.onremovetrack = null;
            // @ts-ignore
            this.connection.onremovestream = null;
            this.connection.onicecandidate = null;
            this.connection.oniceconnectionstatechange = null;
            this.connection.onsignalingstatechange = null;
            this.connection.onicegatheringstatechange = null;
            this.connection.onnegotiationneeded = null;
            this.connection.close();
            this.connection = null;
        }
    }
}

let currentVideoCall: ClientVideoChatData = null;


function initializePeerConnection(clientVideoChatData: ClientVideoChatData) {
    let connection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    clientVideoChatData.connection = connection;
    connection.onicecandidate = async function (event) {
        if (event.candidate) {
            let result = await serverMethods.postIceCandidate({ callRoomId: clientVideoChatData?.callRoom?.id, candidate: event.candidate, sdp: connection.localDescription, sdpId: clientVideoChatData.localSdpId, remoteSdpId: clientVideoChatData.remoteSdpId });
            if (showHttpErrorIfExists(result)) {
                return;
            }
        }
    }
    connection.onnegotiationneeded = function () {
        console.log('onnegotiationneeded event ==========');
        if (currentVideoCall.remoteSdpId < currentVideoCall.localSdpId) {
            console.log("not doing negotiation because haven't received answer yet");
            return;
        }
        if (currentVideoCall.localSdpId > 20) {
            console.log('local sdp too high', currentVideoCall.localSdpId);
            return;
        }
        // await new Promise(resolve => setTimeout(resolve, 1));
        if (currentVideoCall.localSdpId > 10) {
            console.log("#########returning because local sdp too high");
            return;
        }
        currentVideoCall.sendSdpOffer();
        // if (showHttpErrorIfExists(result)) {
        //     return;
        // }
        console.log("current video chat", store.currentVideoChat);
    };

    ///////////////////////////////////////////////////////////////////////////////////////
    // the following three are optional
    (connection as any).onremovetrack = function (event) {
        console.log('track removed', event)
    };
    connection.oniceconnectionstatechange = (event) => {
        console.log('oniceconnectionstatechange event', connection.iceConnectionState);
        switch (connection.iceConnectionState) {
            case "closed":
            case "failed":
                this.closeVideoCall();
                break;
        }
    }
    connection.onicegatheringstatechange = (event) => {
        console.log('onicegatheringstatechange event', connection.iceGatheringState);
    }
    connection.onsignalingstatechange = (event) => {
        console.log('onsignalingstatechange event', connection.signalingState);
    }
    ///////////////////////////////////////////////////////////////////////////////////////

    connection.ontrack = async (event) => {
        console.log("got track", event);
        await Promise.all(clientVideoChatData.remoteVideoPromises);
        if (event.track.kind === "video") {
            remoteVideo.value.srcObject = event.streams[0];
            console.log("starting to play video");
            await remoteVideo.value.play();
            console.log("playing remote video")
            d.showingRemoteVideo = true;
            setRemoteResolution(event.streams[0])
        } else if (event.track.kind === "audio") {
            remoteAudio.value.srcObject = event.streams[0];
            console.log("starting to play audio");
            await remoteAudio.value.play();
            console.log("playing remote audio")
            d.showingRemoteVideo = true;
        }
    }
    return connection;
}
const props = defineProps(["userId"]);
let ringTimeout = null;

const d = reactive({
    store: store,
    incomingCalls: [],
    // incomingCalls: [{
    //     originator: { userName: "bob" },
    //     silenced: false
    // }],
    showingLocalVideo: false,
    showingRemoteVideo: false,
    icons: {
        mdiPhone,
        mdiClose,
        mdiVolumeOff
    },

    localVideoResolution: {} as MediaTrackSettings,
    remoteVideoResolution: {} as MediaTrackSettings
});
onBeforeUnmount(() => {
    unsubscribeFromAll(uid);
});


function setLocalResolution(stream: MediaStream) {
    const videoTrack = stream.getVideoTracks()?.[0];
    if (videoTrack) {
        const settings = videoTrack.getSettings();
        d.localVideoResolution = settings;
    }
}

function setRemoteResolution(stream: MediaStream) {
    const videoTrack = stream.getVideoTracks()?.[0];
    if (videoTrack) {
        const settings = videoTrack.getSettings();
        d.localVideoResolution = settings;
    }
}

async function startCall() {
    console.log("will create call room and notify participants")
    try {
        currentVideoCall?.close();

        // create initial call
        currentVideoCall = new ClientVideoChatData();

        // start local video
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!stream) {
            showAlert("You need to allow access to your camera and microphone to use this feature.");
            return;
        }
        showLocalVideo(stream);
        d.showingLocalVideo = true;
        currentVideoCall.localStream = stream;
        setLocalResolution(stream);

        let result = await serverMethods.postCreateCallRoom({ callRoomId: null, authenticatedUserIds: store.currentVideoChat.recipients });
        if (showHttpErrorIfExists(result)) {
            store.currentVideoChat = null;
            return;
        }
        store.currentVideoChat.callRoom = result.callRoom;
        store.currentVideoChat.recipients = result.users;
        currentVideoCall.callRoom = result.callRoom;

        ringTimeout = setTimeout(() => {
            closeVideoCall(null)
        }, 30000);
    } catch (error) {
        console.error(error);
    }
}
function notificationClicked(incomingCall) {
    if (incomingCall.silenced) {
        incomingCall.silenced = false;
    } else {
        // this.receiveCall(incomingCall);
    }
}

function closeVideoCall(data) {
    console.trace("closing video call data is", data)
    d.showingLocalVideo = false;
    d.showingRemoteVideo = false;
    currentVideoCall?.close();
    currentVideoCall = null;

    console.log("ending video call");
    d.incomingCalls = d.incomingCalls.filter((call) => call.callRoom.id !== data.callRoom.id);
    if (localVideo.value?.srcObject) {
        localVideo.value.srcObject.getTracks().forEach((track) => track.stop());
        localVideo.value.srcObject = null;
        localVideo.value.removeAttribute("src");
    }
    if (remoteAudio.value?.srcObject) {
        remoteAudio.value.srcObject.getTracks().forEach((track) => track.stop());
        remoteAudio.value.srcObject = null;
        remoteAudio.value.removeAttribute("src");
    }

    if (remoteVideo.value?.srcObject) {
        remoteVideo.value.srcObject.getTracks().forEach((track) => track.stop());
        remoteVideo.value.srcObject = null;
        remoteVideo.value.removeAttribute("src");
    }
    store.currentVideoChat = null;
}

function silenceCall(incomingCall) {
    incomingCall.silenced = true;
}

async function rejectCall(incomingCall: any) {
    let result = await serverMethods.postEndVideoChat({ callRoomId: incomingCall.callRoom.id });
    console.log("incoming calls", d.incomingCalls, "call", incomingCall)
    d.incomingCalls = d.incomingCalls.filter((call) => call !== incomingCall);
}

// when you receive a call, you start the sdp session
async function receiveCall(incomingCall) {
    d.incomingCalls = d.incomingCalls.filter((call) => call !== incomingCall);
    currentVideoCall?.close();

    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (!stream) {
        showAlert("You need to allow access to your camera and microphone to use this feature.");
        return;
    }
    currentVideoCall = new ClientVideoChatData();
    currentVideoCall.localStream = stream;
    setLocalResolution(stream);

    console.log("incoming call", incomingCall);
    store.currentVideoChat = {
        callRoom: incomingCall.callRoom,
        recipients: incomingCall.users.map((user) => user.id),
        active: true
    }
    currentVideoCall.callRoom = incomingCall.callRoom;

    await initializePeerConnection(currentVideoCall)
    showLocalVideo(stream);

    let result = await currentVideoCall.sendSdpOffer();
}
function showLocalVideo(stream) {
    d.showingLocalVideo = true;
    localVideo.value.volume = 0;
    localVideo.value.srcObject = stream;
    setLocalResolution(stream);
    localVideo.value.play();
}
async function endVideoChat(data) {
    if (store.currentVideoChat?.callRoom?.id) {
        serverMethods.postEndVideoChat({ callRoomId: store.currentVideoChat.callRoom.id }).catch(err => console.error(err))
    }
    closeVideoCall(data);
}
async function handleEndVideoChatEvent(data) {
    endVideoChat(data);
}
function initVideoChatListeners() {
    subscribeToEvents(uid, [{
        guid: crypto.randomUUID(),
        type: "videoChatCallRequest",
        callback: async (event) => {
            console.log("video chat call request", event.data);
            d.incomingCalls.push({ ...event.data, received: Date.now() });
        }
    }, {
        guid: crypto.randomUUID(),
        type: "videoChatSdpOffer",
        callback: async (event) => {
            clearTimeout(ringTimeout);
            console.log("received video chat sdp offer", event.data);
            if (!currentVideoCall?.connection) {
                console.log("must make connection receiving sdp offer")
                await initializePeerConnection(currentVideoCall);
                // currentVideoCall.connection.setLocalDescription(currentVideoCall.currentOffers[currentVideoCall.localSdpId])
            }
            if (event.data.sdpId > currentVideoCall.remoteSdpId) {
                console.log("will send sdp answer")
                currentVideoCall.remoteSdpId = event.data.sdpId;
                currentVideoCall.remoteDescription = new RTCSessionDescription(event.data.offer);
                await currentVideoCall.connection.setRemoteDescription(currentVideoCall.remoteDescription);
                currentVideoCall.sendSdpAnswer();
            }
        }
    },
    // {
    //     guid: crypto.randomUUID(),
    //     type: "videoChatCallAnswer",
    //     callback: (event) => {
    //         console.log("video chat call answer", event.data);
    //         if (!currentVideoCall.connection.remoteDescription) {
    //             currentVideoCall.remoteDescription = new RTCSessionDescription(event.data.sdp);
    //             currentVideoCall.connection.setRemoteDescription(currentVideoCall.remoteDescription).catch((error) => {
    //                 showAlert("Error setting remote description in: videoChatCallAnswer" + error);
    //             });
    //         }
    //     }
    // }, 
    {
        guid: crypto.randomUUID(),
        type: "videoChatSdpAnswer",
        callback: async (event) => {
            console.log("video chat sdp answer", event.data);
            currentVideoCall.trySetRemoteDescription(event.data.answer, event.data.remoteSdpId, event.data.sdpId)
        }
    }, {
        guid: crypto.randomUUID(),
        type: "iceCandidate",
        callback: async (event) => {
            console.log("got ice candidate, adding to connection", event);
            if (!currentVideoCall || currentVideoCall.callRoom.id != event.data.callRoom.id) {
                currentVideoCall?.close();
                currentVideoCall = new ClientVideoChatData();
                await initializePeerConnection(currentVideoCall);
            }
            if (currentVideoCall.remoteSdpId != event.data.sdpId || currentVideoCall.localSdpId != event.data.remoteSdpId) {
                console.log("adding to buffered ice candidate because ", currentVideoCall.remoteSdpId, "not <", event.data.sdpId)
                currentVideoCall.bufferedIceCandidates.push(event.data);
                return;
            }
            if (!currentVideoCall.localStreamAttachedToConnection) {
                currentVideoCall.attachLocalStreamToConnection();
            }
            currentVideoCall.tryAddIceCandidate(event.data);
        }
    }, {
        guid: crypto.randomUUID(),
        type: "videoChatReject",
        callback: (event) => {
            console.log("video chat call rejected", event.data);
            closeVideoCall(event.data);
        }
    }, {
        guid: crypto.randomUUID(),
        type: "endVideoChat",
        callback: (event) => {
            console.log("video chat call ended", event.data);
            handleEndVideoChatEvent(event.data);
        }
    }, {
        guid: crypto.randomUUID(),
        type: "chatMessage",
        callback: (event) => {
            if (store.onChatMessageReceived) {
                store.onChatMessageReceived(event);
            } else {
                showAlert("Text received: " + event.data.text);
            }
        }
    }]);
}

watch(() => store?.currentVideoChat, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue && !newValue.active) {
        console.log("store current video chat changed")
        startCall();
    }
}, { deep: true, immediate: true });

watch(() => store?.authenticatedUser?.id, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
        console.log("initing video chat listeners", "new value", newValue, "old value", oldValue);
        initVideoChatListeners();
    } else if (!newValue && oldValue) {
        console.log("unsubscribing")
        unsubscribeFromAll(this);
    }
}, { immediate: true });

</script>
<template>
    <div class="video-call-notification" v-for="incomingCall of d.incomingCalls" :class="{ silenced: incomingCall.silenced }" @click="notificationClicked(incomingCall)">
        <div style="text-align: center; font-size: 16px; line-height: 1;" class="title">Incoming Video Call</div>
        <!-- <div style="text-align:center;justify-content: center;font-weight: bold;margin-top: 10px;">User Name</div> -->
        <div class="info">
            <div class="incoming-user-name">{{ incomingCall?.originator?.userName }}</div>
            <div class="simple-button answer-button" @click="receiveCall(incomingCall)">
                <v-icon :icon="mdiPhone"></v-icon>
                <div>Answer</div>
            </div>
            <div class="simple-button reject-button" @click="rejectCall(incomingCall)">
                <v-icon :icon="mdiClose"></v-icon>
                <div>Reject</div>
            </div>
            <div class="simple-button silence-button" @click.stop="silenceCall(incomingCall)">
                <v-icon :icon="mdiVolumeOff"></v-icon>
                <div>Silence</div>
            </div>
        </div>
    </div>
    <div class="video-chat" v-if="store.currentVideoChat">
        <div class="video-container local-video-container" :class="{ 'solo': d.showingLocalVideo && !d.showingRemoteVideo, visible: d.showingLocalVideo }" :style="{ width: '200px', height: 200 / (d.localVideoResolution?.aspectRatio || 1) + 'px'}">
            <!-- <div>Local</div> -->
             <!-- <div>{{ d.localVideoResolution }}</div> -->
            <video ref="localVideo" autoplay></video>
        </div>
        <div class="video-container remote-video-container" :class="{ 'solo': d.showingRemoteVideo && !d.showingLocalVideo, visible: d.showingRemoteVideo }" >
            <!-- <div>Remote</div> -->
            <video ref="remoteVideo" autoplay></video>
            <audio ref="remoteAudio" autoplay style="width: 0;height:0; overflow:hidden;"></audio>
        </div>
        <div class="video-controls">
            <button class="close" @click="endVideoChat">End</button>
        </div>
    </div>
</template>
<style lang="scss">
@import "@/scss/variables";
.video-call-notification {
    padding: 10px;
    border-radius: 4px;
    top: 10px;
    right: 50%;
    transform: translateX(50%);
    width: 96%;
    max-width: 400px;
    position: fixed;
    z-index: 100;
    background: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    opacity: 1;
    transition: all 0.2s;
    &.silenced {
        right: 5px;
        transform: translateX(0%);
        width: auto;
        cursor: pointer;
        user-select: none;
        .title {
            display: none;
        }
        .simple-button {
            display: none;
        }
        .info {
            margin: 0;
        }
        .incoming-user-name {
            margin-right: 0;
        }
    }
    .simple-button {
        transition: .2s all;
        overflow: hidden;
        margin: 0;
        padding: 4px 6px;
        line-height: 1;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        .v-icon {
            margin-right: 8px;
        }
        margin-right: 5px;
        &:last-of-type {
            margin-right: 0;
        }
        &.answer-button {
            background: #00b624;
        }
        &.reject-button {
            background: #e73858;
        }
    }
    .info {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        align-items: center;
        >* {
            margin-right: 10px;
        }
    }
    .incoming-user-name {
        line-height: 1;
        font-weight: bold;
        padding: 4px 6px;
        // background: blue;
        // border-radius: 5px;
        // color: white;
    }
}
// .video-container.local-video-container {
//     width: 0vw;
//     height: 0vh;
//     position: fixed;
//     bottom: 20px;
//     right: 20px;
//     z-index: 100;
//     transition: .2s all;
//     &.visible {
//         width: 400px;
//         height: 200px;
//         @media (max-width: $mobileBreakPoint) {
//             width: 50px;
//             height: 50px;
//         }
//     }
//     &.visible.solo {
//         width: 100vw;
//         height: 100vh;
//         bottom: 0;
//         right: 0;
//     }
// }
.video-chat {
    .local-video-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 101;
        border-radius: 5px;
        box-shadow: 0 0 rgba(0, 0, 0, 0.5);
        width: 400px;
        height: 200px;
    }
    .remote-video-container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        border-radius: 5px;
        box-shadow: 0 0 rgba(0, 0, 0, 0.5);
        width: 100vw;
        height: 100vh;
        background: white;
        video {
            width: 100%;
            height: 100%;
        }
    }
    .video-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        video {
            // border: 1px solid black;
            max-width: 100%;
            max-height: 100%;
        }
    }
    .video-controls {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 5px;
        padding: 8px;
        z-index: 1000;
        box-shadow: 0 0 5px rgba(0, 0, 0, .5);
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
        button {
            line-height: 1;
            padding: 7px 10px;
            &.close {
                background: red;
                color: white;
                border-radius: 4px;
            }
        }
    }
}
</style>