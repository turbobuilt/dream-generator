<script lang="ts" setup>
import { reactive, computed, getCurrentInstance, ref, onBeforeUnmount } from "vue";
import ChatMessagesComponent from "./components/ChatMessagesComponent.vue";
import { store } from "../../store";
import { router } from "../../lib/router";
import { onMounted } from "vue";
import { downloadLlamaCpp } from "../../lib/downloadLlamaCpp";
import ModelDownloadProgress from "../../components/ModelDownloadProgress.vue";
import { loadModel, submitPrompt, unloadModel } from "../../app/llm/llama";

const d = store.chatModelState;

const id = computed(() => router.currentRoute.value.params.id as string);

onMounted(async () => {
  if (!d.modelData) {
    d.modelData = store.models[id.value];
  }
  if (d.modelData.downloaded) {
    loadModelLocal();
  }
  let data = await ipcRenderer.invoke("getPlatformInfo");
  console.log("platform info", data);
});

onBeforeUnmount(async () => {
  await unloadModel(id.value);
});

async function loadModelLocal() {
  try {
    await loadModel(id.value);
  } catch (e) {
    if (e?.lamacpp_not_present) {
      downloadLlamaCpp();
      return;
    } else if (e?.model_not_found) {
      d.modelData.extracted = false;
    } else {
      d.error = e.message || "error loading model";
    }
  }
}


let server = null;
import cp from "child_process";
import { ipcRenderer } from "electron";
// import openvino from "openvino-node";
// console.log("openvino is", openvino)
async function loadModelServer(id) {
    server = cp.spawn("C:/Users/hdtru/prg/dreamgenerator-monorepo/electron/llamacpp/win32_x64/avx2/server.exe", ["-m", '"C:/Users/hdtru/AppData/Roaming/Dream Generator AI/downloaded_models/mistral-7b"'], {
        // stdio: "inherit",
        shell: true,
        cwd: "C:/Users/hdtru/prg/dreamgenerator-monorepo/electron/llamacpp/win32_x64/avx2"
    });
    // if (server) {
    //     forceKill(server.pid).catch(err => console.error("caught error killing server", err));
    // }
    // await llamaCpp.loadStatus();
    // if (!llamaCpp.extracted) {
    //     console.log("Extracted not present");
    //     throw { lamacpp_not_present: true }
    // }
    // console.log("Starting server")
    // let serverLocation = await getLlamaCppPath();
    // serverLocation = serverLocation.replace(/\\/g, "/")
    // let model = models[id];
    // let modelPath = await model.getModelPath();


    // console.log("Model path", modelPath);
    // // make sure it exists
    // if (!await fileExists(modelPath)) {
    //     console.log("error file does not exist")
    //     model.extracted = false;
    //     throw { error: "Model not found downloaded", model_not_found: true }
    //     return;
    // }
    // console.log("start command", serverLocation, "-m", modelPath)
    // server = spawn(`"${basename(serverLocation)}"`, ["-m", `"${modelPath}"`], {
    //     // stdio: "inherit",
    //     shell: true,
    //     cwd: dirname(serverLocation)
    // });

    server.stdout.on('data', (data) => {
        console.log("stdout ", data.toString());
    });
    server.stderr.on('data', (data) => {
        console.error("stderr error", data.toString());
    });
    server.on("close", (data) => {
        console.log("closed...", data)
    })
    server.on("exit", (data) => {
        console.log("exit...", data)
    })
    server.on("error", (data) => {
        console.error("error...", data)
    })
}

setTimeout(() => {
  console.log("loading model server");
    loadModelServer("mistral-7b").catch(console.error);
}, 1000);

const promptInput = ref(null);
function reset() {
  d.error = "";
  d.messages.splice(0, d.messages.length);
  promptInput.value.focus();
}

let instance = getCurrentInstance();

async function mainButtonClicked() {
  if (!d.loading) {
    sendMessage().catch(console.error);
  } else {
    d.loading = false;
    loadModelLocal().catch(console.error);
  }
}

// this function calls ipcRenderer to invoke this function
// ipcMain.addListener('submitChatPrompt', async function (event, data) {
//     try {
//         let textStream = await submitPromptPreload(data);
//         for await (const textPart of textStream) {
//             event.sender.send('chat_message', textPart);
//         }
//         event.sender.send('chat_message_complete')
//     } catch (err) {
//         event.sender.send('chat_message_complete');
//         event.sender.send('chat_message_error', err.stack)
//         console.error(err);
//     }
// });

async function* submitChatPromptMain(data) {
  const { port1: portRenderer, port2: portMain } = new MessageChannel();
  
  ipcRenderer.postMessage("submitChatPrompt", data, [portMain]);
  console.log("posted message");
  while (true) {
    var { message, error, done } = await new Promise((resolve, reject) => {
      portRenderer.onmessage = (event: any) => {
        switch (event.event) {
          case "chat_message":
            resolve({ message: event.data });
            break;
          case "chat_message_error":
            resolve({ error: event.data });
            break;
          case "chat_message_complete":
            resolve({ done: true });
            break;
        }
      };
    }) as any;
    console.log("message", message, error, done);
    if (done || error) {
      break;
    }
    yield message;
  }
}

async function sendMessage() {
  if (!d.prompt) return;
  try {
    d.loading = true;
    d.messages.push({ content: d.prompt, role: "user" });
    d.prompt = "";
    d.error = "";
    try {
      var textStream = await submitChatPromptMain({
        messages: JSON.parse(JSON.stringify(d.messages)),
      });
    } catch (e) {
      if (e?.lamacpp_not_present) {
        downloadLlamaCpp();
        return;
      }
      throw e;
    }
    let newMessage = reactive({ content: "", role: "assistant" });
    d.messages.push(newMessage);
    let container = document.querySelector(".chat-messages-component");
    let component = instance?.appContext.app;
    for await (const textPart of textStream) {
      newMessage.content += textPart;
      console.log("get message", textPart)
      setTimeout(() => {
        // if it's within 15 px of bottom, scroll to bottom
        if (
          container.scrollTop + container.clientHeight + 50 >=
          container.scrollHeight
        ) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
    d.loading = false;
  } catch (e) {
    console.error(e);
    d.error = e.message;
  } finally {
    d.loading = false;
  }
}
</script>
<template>
  <div class="ai-chat-page" v-if="d.modelData">
    <v-card>
      <v-card-text v-if="!d.modelData.extracted || !d.modelData.downloaded">
        <ModelDownloadProgress :model-data="d.modelData" />
      </v-card-text>
      <div v-else-if="d.modelData.downloaded" class="chat-display">
        <ChatMessagesComponent :messages="d.messages" @reset="reset" />
        <div class="input-container">
          <v-textarea
            ref="promptInput"
            class="main-text-area"
            :rows="1"
            :auto-grow="true"
            label="Message"
            v-model="d.prompt"
            hide-details="auto"
            :autofocus="true"
            @keydown.tab.prevent="sendMessage()"
          />
          <v-btn
            class="generate-button"
            color="primary"
            @click="mainButtonClicked"
          >
            <div v-if="!d.loading">Send</div>
            <v-progress-circular
              v-else
              indeterminate
              color="white"
              :size="22"
            ></v-progress-circular>
          </v-btn>
        </div>
      </div>
      <div class="error" v-if="d.error">{{ d.error }}</div>
    </v-card>
  </div>
  <div v-else>Error - Model not found, please contact support</div>
</template>
<style lang="scss">
.ai-chat-page {
  display: flex;
  flex-direction: column;
  // flex-grow: 1;
  height: 100%;
  .chat-display {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: auto;
    .input-container {
      display: flex;
      .v-textarea {
        flex: 1;
      }
    }
  }
  .error {
    padding: 10px;
    color: red;
  }
  > .v-card {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    > .v-card-text {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  }
  .input-container {
    display: flex;
    .v-textarea {
      flex: 1;
    }
  }
  padding: 10px;
  .generate-button {
    height: auto;
    border-radius: 0;
  }
}
</style>