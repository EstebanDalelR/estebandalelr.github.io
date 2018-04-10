"use strict";
/* Disclaimer: some of this code was obtained from webglfundamentals.org, and belongs to them */

var camera = "botonLongshot"

function changeCamera(newCamera) {
    camera = newCamera
}

document.getElementById("botonPrimeraPersona").onclick =
    function () { changeCamera("botonPrimeraPersona") };

document.getElementById("botonTerceraPersona").onclick =
    function () { changeCamera("botonTerceraPersona") };

document.getElementById("botonLongshot").onclick =
    function () { changeCamera("botonLongshot") };

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    var matrixStack = new MatrixStack();

    var createFlattenedVertices = function (gl, vertices) {
        return webglUtils.createBufferInfoFromArrays(
            gl,
            primitives.makeRandomVertexColors(
                primitives.deindexVertices(vertices),
                {
                    vertsPerColor: 6,
                    rand: function (ndx, channel) {
                        return channel < 3 ? ((128 + Math.random() * 128) | 0) : 255;
                    }
                })
        );
    };

    var sphereBufferInfo = createFlattenedVertices(gl, primitives.createSphereVertices(10, 12, 6));
    var cubeBufferInfo = createFlattenedVertices(gl, primitives.createCubeVertices(20));
    var coneBufferInfo = createFlattenedVertices(gl, primitives.createTruncatedConeVertices(10, 0, 20, 12, 1, true, false));

    // setup GLSL program
    var programInfo = webglUtils.createProgramInfo(gl,
        ["3d-vertex-shader", "3d-fragment-shader"]);

    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    var image = new Image();
    image.src = "./basketball.png";
    image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(60);
    var cameraHeight = 50;

    // Uniforms for each object.
    var sphereUniforms = {
        u_colorMult: [0.5, 1, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var cubeUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var coneUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_matrix: m4.identity(),
    };
    var sphereTranslation = [0, 0, 0];
    var cubeTranslation = [-40, 80, 80];
    var coneTranslation = [40, 40, 40];

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation, zRotation, time) {
        var matrix = m4.translate(viewProjectionMatrix,
            Math.sin(time) * translation[0],
            Math.cos(time) * translation[1],
            Math.sin(time) * translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        matrix = m4.yRotate(matrix, yRotation);
        return m4.zRotate(matrix, zRotation);
    }

    requestAnimationFrame(drawScene);


    // Draw the scene.
    function drawScene(time) {
        time *= 0.0005;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);


        // Compute the camera's matrix using look at.
        switch (camera) {
            case "botonLongshot":
                var cameraPosition = [0, 0, 200];
                var target = sphereTranslation;
                break;
            case "botonPrimeraPersona":
                var cameraPosition = sphereTranslation;
                var target = [
                    Math.sin(time) * cubeTranslation[0],
                    Math.cos(time) * cubeTranslation[1],
                    Math.sin(time) * cubeTranslation[2],
                ];
                //var target = cubeTranslation;
                break;
            case "botonTerceraPersona":
                var cameraPosition = [20, 20, 20];
                var target = sphereTranslation;
                break;
            default:
                var cameraPosition = [0, 0, 200];
                var target = sphereTranslation;
                break;
        }
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var sphereXRotation = time;
        var sphereYRotation = time;
        var cubeXRotation = -time;
        var cubeYRotation = time;
        var coneXRotation = time;
        var coneYRotation = -time;

        matrixStack.save();
        matrixStack.translate(gl.canvas.width, gl.canvas.height / 2);
        matrixStack.rotateZ(time);

        matrixStack.save();
        {
            // ------ Draw the sphere --------
            matrixStack.translate(cubeTranslation);
            gl.useProgram(programInfo.program);

            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);

            sphereUniforms.u_matrix = computeMatrix(
                viewProjectionMatrix,
                sphereTranslation,
                sphereXRotation,
                sphereYRotation,
                0,
                time);

            // Set the uniforms we just computed
            webglUtils.setUniforms(programInfo, sphereUniforms);

            gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);
        }

        matrixStack.restore();

        matrixStack.save();
        {
            // ------ Draw the cube --------
            matrixStack.translate(cubeTranslation);
            matrixStack.scale(0.2, 0.2);
            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);

            cubeUniforms.u_matrix = computeMatrix(
                viewProjectionMatrix,
                cubeTranslation,
                cubeXRotation,
                cubeYRotation,
                0,
                time);
            // Set the uniforms we just computed
            webglUtils.setUniforms(programInfo, cubeUniforms);

            gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);
            // ------ Draw the cone --------
            matrixStack.translate(cubeTranslation);

            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);
            coneUniforms.u_matrix = computeMatrix(
                viewProjectionMatrix,
                coneTranslation,
                coneXRotation,
                coneYRotation,
                0,
                time);

            // Set the uniforms we just computed
            webglUtils.setUniforms(programInfo, coneUniforms);

            gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);
        }
        matrixStack.restore();

        matrixStack.save();
        {
            // ------ Draw the cone --------

            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);

            coneUniforms.u_matrix = computeMatrix(
                viewProjectionMatrix,
                coneTranslation,
                coneXRotation,
                coneYRotation,
                0,
                time);

            // Set the uniforms we just computed
            webglUtils.setUniforms(programInfo, coneUniforms);

            gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);

        }

        requestAnimationFrame(drawScene);
    }
}
function MatrixStack() {
    this.stack = [];

    // since the stack is empty this will put an initial matrix in it
    this.restore();
}

// Pops the top of the stack restoring the previously saved matrix
MatrixStack.prototype.restore = function () {
    this.stack.pop();
    // Never let the stack be totally empty
    if (this.stack.length < 1) {
        this.stack[0] = m4.identity();
    }
};

// Pushes a copy of the current matrix on the stack
MatrixStack.prototype.save = function () {
    this.stack.push(this.getCurrentMatrix());
};

// Gets a copy of the current matrix (top of the stack)
MatrixStack.prototype.getCurrentMatrix = function () {
    return this.stack[this.stack.length - 1].slice();
};

// Lets us set the current matrix
MatrixStack.prototype.setCurrentMatrix = function (m) {
    return this.stack[this.stack.length - 1] = m;
};

// Translates the current matrix
MatrixStack.prototype.translate = function (x, y, z) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.translate(m, x, y, z));
};

// Rotates the current matrix around Z
MatrixStack.prototype.rotateZ = function (angleInRadians) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
};

// Scales the current matrix
MatrixStack.prototype.scale = function (x, y, z) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.scale(m, x, y, z));
};



main();
