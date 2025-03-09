// // // import axios from "axios";

// // // export async function main() {
// // //     let url = "https://noise-destroyer--stable-diffusion-xl-app-turbobuilt-dev.modal.run/infer";
// // //     let response = await axios.post(url, {
// // //         prompt: "a dog",
// // //         task_id: "a12345",
// // //         upload_url: "None",
// // //         progress_url: "None"
// // //     });
// // // }


// // class MyNumber {
// //     constructor(private value: number) {}
// //     add(num: number): number {
// //         return this.value + num;
// //     }
// // }

// // const iterations = 1000000;
// // let startTime: number, endTime: number;
// // let result: number;

// // // Benchmark direct addition
// // startTime = performance.now();
// // for (let i = 0; i < iterations; i++) {
// //     result = 1 + 2;
// // }
// // endTime = performance.now();
// // console.log(`Direct addition: ${endTime - startTime} ms`);

// // // Benchmark class method addition
// // const myNumber = new MyNumber(1);
// // startTime = performance.now();
// // for (let i = 0; i < iterations; i++) {
// //     result = myNumber.add(i);
// // }
// // endTime = performance.now();
// // console.log(`Class method addition: ${endTime - startTime} ms`);


// class MyNumber {
//     private buffer: Float32Array;

//     constructor(sharedBuffer: SharedArrayBuffer, index: number) {
//         this.buffer = new Float32Array(sharedBuffer);
//         this.index = index;
//     }

//     add(num: number): number {
//         return this.buffer[this.index] + num;
//     }
// }

// const buffer = new SharedArrayBuffer(4); // 4 bytes for a single Float32
// const floatArray = new Float32Array(buffer);
// floatArray[0] = 1.0;

// const iterations = 1000000;
// let startTime: number, endTime: number;
// let result: number = 0;

// // Benchmark direct addition
// startTime = performance.now();
// for (let i = 0; i < iterations; i++) {
//     result += i;
// }
// endTime = performance.now();
// console.log(`Direct addition: ${endTime - startTime} ms`);

// // Benchmark class method addition with SharedArrayBuffer
// const myNumber = new MyNumber(buffer, 0);
// startTime = performance.now();
// for (let i = 0; i < iterations; i++) {
//     myNumber.add(i);
// }
// endTime = performance.now();
// console.log(`Class method addition with SharedArrayBuffer: ${endTime - startTime} ms`);


class MyNumber {
    private buffer: Float32Array;
    private index: number;

    constructor(sharedBuffer: SharedArrayBuffer, index: number) {
        this.buffer = new Float32Array(sharedBuffer);
        this.index = index;
    }

    add(num: number): number {
        return this.buffer[this.index] + num;
    }

    subtract(num: number): number {
        return this.buffer[this.index] - num;
    }

    multiply(num: number): number {
        return this.buffer[this.index] * num;
    }

    divide(num: number): number {
        return this.buffer[this.index] / num;
    }
}

const buffer = new SharedArrayBuffer(4); // 4 bytes for a single Float32
const floatArray = new Float32Array(buffer);
floatArray[0] = 0.0;

const iterations = 1000000000;
let startTime: number, endTime: number;
let result: number;

// Leibniz formula for π: π = 4 * (1 - 1/3 + 1/5 - 1/7 + 1/9 - ...)

// Benchmark direct arithmetic operations
startTime = performance.now();
result = 0;
for (let i = 0; i < iterations; i++) {
    const term = (i % 2 === 0 ? 1 : -1) / (2 * i + 1);
    result += term;
}
result *= 4;
endTime = performance.now();
console.log(`Direct arithmetic operations: ${endTime - startTime} ms, π ≈ ${result}`);

// Benchmark class method operations with SharedArrayBuffer
const myNumber = new MyNumber(buffer, 0);
startTime = performance.now();
for (let i = 0; i < iterations; i++) {
    const term = (i % 2 === 0 ? 1 : -1) / (2 * i + 1);
    floatArray[0] = myNumber.add(term);
}
floatArray[0] = myNumber.multiply(4);
endTime = performance.now();
console.log(`Class method operations with SharedArrayBuffer: ${endTime - startTime} ms, π ≈ ${floatArray[0]}`);