const m4 = twgl.m4;
const canvas = document.querySelector("#c")
const gl = canvas.getContext("webgl"); //获取webgl上下文


//可调参数
// mark1
// 设置光照（光源和材质） *注意传入的光照颜色都已事先乘了光强因子
var uniforms = {
    //光源
    u_lightWorldPos: [100, 100, 300], //光源位置
    u_pointLightColor: [1, 1, 1, 1], //点光的颜色
    u_ambientLightColor: [1, 1, 1, 1], //环境光颜色
    u_lightFactor: [0.2, 0.8], //光强因子

    // 材质
    u_ambient: [1, 1, 1, 1], //环境光反射
    u_specular: [1, 1, 1, 1], // 镜面反射
    u_diffuse: tex, // 纹理（漫反射）
    u_mydiffuse: [1, 1, 1, 1], //漫反射
    u_customdiffuse: false,
    u_reflectFactor: [0.5, 0.5, 0.5], //  三种反射的反射因子

    u_shininess: 100, // 光泽强度（反应材质的细腻程度，1~2000）
};




// mesh 加载模型
var mesh
var tex
var objects = []
// 获取模型文件
var input = document.getElementById("file"); // input file
input.onchange = function () {

    console.log(this.files);

    var files = this.files;

    var json
    var bin
    var png

    // 获取file对象
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        console.log(file.type);
        switch (file.type) {
            case "application/json":
                json = file
                break
            case "application/octet-stream":
                bin = file
                break
            case "image/png":
                png = file
                break

        }
    }

    // 检查 （必须有json和bin文件）
    if (json == undefined) {
        alert("请输入网格文件！")
    }
    if (bin == undefined) {
        alert("请输入网格数据文件")
    }

    // 读取文件
    var jsonreader = new FileReader()
    jsonreader.readAsText(json)
    jsonreader.onload = function () {
        mesh = JSON.parse(this.result)
        console.log("mesh=", mesh);
    }
    var binreader = new FileReader()
    binreader.readAsArrayBuffer(bin)
    binreader.onload = function () {
        var buffer = this.result
        console.log("buffer=", buffer);
        objects = createObjects(mesh, buffer, objects)
    }
    // 如果npg文件存在
    if (png != undefined) {

        createImageBitmap(png).then(res => {
            tex = twgl.createTexture(gl, {
                src: res,
            })
            console.log("tex", tex);
        })


    }


    requestAnimationFrame(CTRrender);

}




// 根据accessor 和 bufferView 产生顶点缓存（dataview）
function createDataview(buffer, accessor, bufferView) {
    var offset = accessor.byteOffset + bufferView.byteOffset

    var type
    switch (accessor.type) {
        case "SCALAR":
            type = 1
            break;
        case "VEC3":
            type = 3
            break;
        case "VEC4":
            type = 4
            break;
        case "VEC2":
            type = 2
            break;
        default:
            type = 1
            break;
    }


    var length = accessor.count * type


    var dataView
    switch (accessor.componentType) {
        case 5123:
            dataView = new Uint16Array(buffer, offset, length)
            break;
        case 5126:
            dataView = new Float32Array(buffer, offset, length)
            break;
        default:
            dataView = new Uint16Array(buffer, offset, length * 2)
            break;
    }

    return dataView
}

// 根据顶点缓存（dataview）产生待绘制对象数组
function createObjects(gltf, buffer, objects) {
    objects = []
    gltf.meshes.forEach(mesh => {
        mesh.primitives.forEach(primitive => {
            // var accessor = gltf.accessors[]
            var object = {}

            // position
            var accessor = gltf.accessors[primitive.attributes.POSITION];
            var bufferView = gltf.bufferViews[accessor.bufferView]
            object.position = createDataview(buffer, accessor, bufferView)

            // normal
            var accessor = gltf.accessors[primitive.attributes.NORMAL];
            var bufferView = gltf.bufferViews[accessor.bufferView]
            object.normal = createDataview(buffer, accessor, bufferView)

            // texcoord
            var accessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
            var bufferView = gltf.bufferViews[accessor.bufferView]
            object.texcoord = createDataview(buffer, accessor, bufferView)


            //indices
            var accessor = gltf.accessors[primitive.indices];
            var bufferView = gltf.bufferViews[accessor.bufferView]
            object.indices = createDataview(buffer, accessor, bufferView)

            //
            objects.push(object)
            // console.log("objects", objects);

        })
    })

    return objects
}






// init 设定相关尺寸，开启深度测试和背面剔除
twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);




//EvenHandle 注册鼠标键盘等控制事件
var curScale = 1
var transX = 0
var transY = 0
var curWorld = m4.identity()
var curentMouse = {
    x: 0,
    y: 0
}
var dragging = false



canvas.onmousedown = function (e) {
    dragging = true
    curentMouse.x = e.offsetX
    curentMouse.y = e.offsetY
    console.log("mouse", curentMouse);
}

canvas.onmousemove = function (e) {
    var step = 0.01
    if (dragging) {



        var deltax = (e.offsetX - curentMouse.x) * step
        curentMouse.x = e.offsetX


        var deltay = (e.offsetY - curentMouse.y) * step
        curentMouse.y = e.offsetY

        var rotateX = m4.rotationY(deltax)
        var rotateY = m4.rotationX(deltay)


        curWorld = m4.multiply(rotateX, curWorld)
        curWorld = m4.multiply(rotateY, curWorld)


    }
}

canvas.onmouseup = function (e) {
    dragging = false
}

canvas.onmousewheel = function (e) {
    if (e.wheelDelta > 0) {
        curScale = curScale * 1.1;
    } else {
        curScale = curScale * 0.9;
    }

    //    world=m4.scale(world,[curScale,curScale,curScale])
    console.log(curScale);

}

document.onkeypress = function (e) {
    var step = 1;
    if (e.key == 's') {
        // curWorld = m4.translate(curWorld, [0, step * curScale, 0])
        // console.log(curWorld);
        transY -= step;
    }
    if (e.key == 'w') {
        // curWorld = m4.translate(curWorld, [0, -step * curScale, 0])
        // console.log(curWorld);
        transY += step;
    }
    if (e.key == 'a') {
        // curWorld = m4.translate(curWorld, [-step * curScale, 0, 0])
        // console.log(curWorld);
        transX -= step;
    }
    if (e.key == 'd') {
        // curWorld = m4.translate(curWorld, [step * curScale, 0, 0])
        // console.log(curWorld);
        transX += step;
    }
}








// Program 编译链接着色器
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);









// MVP 定义映射矩阵
const projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 1000);

const eye = [0, 0, 200];
const target = [0, 0, 0];
const up = [0, 1, 0];
const camera = m4.lookAt(eye, target, up);
const view = m4.inverse(camera);
const viewProjection = m4.multiply(projection, view);

const world = m4.rotationY(1);

uniforms.u_viewInverse = camera;
uniforms.u_world = world;
uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);


gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);






// 随时间旋转动画，目前使用的是控制动画
function Anim(time) {
    time *= 0.001;

    const world = m4.rotationY(time);

    uniforms.u_viewInverse = camera;
    uniforms.u_world = world;
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // 调用GPU
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(Anim);
}


// 声明顶点缓存信息数组
var bufferInfos = []
var objectsInit = false

// 随控制变化动画
function CTRrender(time) {
    if (objects.length == 0 || tex == undefined) {

    } else {

        if (!objectsInit) {
            console.log("objectsInit", tex, objects);
            uniforms.u_diffuse = tex
            objects.forEach(object => {
                bufferInfos.push(twgl.createBufferInfoFromArrays(gl, object))
            })
            objectsInit = true
        }


        //适应窗口
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //移位控制
        var afterTrans = m4.translate(curWorld, [transX * curScale, transY * curScale, 0])
        //缩放控制
        const world = m4.scale(afterTrans, [curScale, curScale, curScale])


        // 更新世界矩阵
        uniforms.u_viewInverse = camera;
        uniforms.u_world = world;
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);



        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        gl.useProgram(programInfo.program);
        twgl.setUniforms(programInfo, uniforms);


        //objects
        bufferInfos.forEach(iterm => {
            twgl.setBuffersAndAttributes(gl, programInfo, iterm);
            gl.drawElements(gl.TRIANGLES, iterm.numElements, gl.UNSIGNED_SHORT, 0);
        })

    }


    requestAnimationFrame(CTRrender);
}



console.log("Draw 按钮注册事件");
document.querySelector('#begin').addEventListener("click", function () {
    document.querySelector("#file").click()
    document.querySelector('#begin').style.visibility = "hidden";
    document.querySelector('#rechoose').style.visibility = "visible";
})

document.querySelector('#rechoose').addEventListener("click", e => {
    document.querySelector("#file").click()
})