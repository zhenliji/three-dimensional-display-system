// UI界面的部分控件支持
var customDiffuse = false

//材质-漫反射颜色的确认
document.querySelector("#customDiffuse").addEventListener("change", e => {
    console.log("value", e.target.value, e.target.checked);
    customDiffuse = e.target.checked
    console.log(e);
    var diffusecolor = document.querySelector("#customDiffuseInput")
    if (customDiffuse) {
        diffusecolor.style.visibility = "visible";

    } else {
        diffusecolor.style.visibility = "hidden";
    }
    console.log(diffusecolor, customDiffuse);
    uniforms.u_customdiffuse = customDiffuse;
})


//光照
//环境光
document.querySelector("#ambientLight").addEventListener("input", (e) => {
    var hex = e.target.value;
    uniforms.u_ambientLightColor = Hex2RGBA(hex);
    console.log(hex, uniforms.u_ambientLightColor);

})

document.querySelector("#ambientLightFactor").addEventListener("input", (e) => {
    uniforms.u_lightFactor[0] = e.target.value
})

// 点光源
document.querySelector("#pointLight").addEventListener("input", (e) => {
    var hex = e.target.value;
    uniforms.u_pointLightColor = Hex2RGBA(hex);
})
document.querySelector("#pointLightFactor").addEventListener("input", (e) => {
    uniforms.u_lightFactor[1] = e.target.value
})
// 点光源位置
document.querySelector("#lightx").addEventListener("input", (e) => {
    uniforms.u_lightWorldPos[0] = e.target.value
})
document.querySelector("#lighty").addEventListener("input", (e) => {
    uniforms.u_lightWorldPos[1] = e.target.value
})
document.querySelector("#lightz").addEventListener("input", (e) => {
    uniforms.u_lightWorldPos[2] = e.target.value
})


//材质
document.querySelector("#shininess").addEventListener("input", (e) => {
    uniforms.u_shininess = e.target.value
})


document.querySelector("#ambientcolor").addEventListener("input", (e) => {
    var hex = e.target.value;
    uniforms.u_ambient = Hex2RGBA(hex);
})
document.querySelector("#ambientcolorFactor").addEventListener("input", (e) => {
    uniforms.u_reflectFactor[0] = e.target.value
    console.log(uniforms.u_reflectFactor);
})

document.querySelector("#specularcolor").addEventListener("input", (e) => {
    var hex = e.target.value;
    uniforms.u_specular = Hex2RGBA(hex);
})
document.querySelector("#specularcolorFactor").addEventListener("input", (e) => {
    uniforms.u_reflectFactor[2] = e.target.value
})

document.querySelector("#diffusecolor").addEventListener("input", (e) => {
    var hex = e.target.value;
    uniforms.u_mydiffuse = Hex2RGBA(hex);
})
document.querySelector("#diffusecolorFactor").addEventListener("input", (e) => {
    uniforms.u_reflectFactor[1] = e.target.value
})




// tool func
function Hex2RGBA(hex) {
    return [parseInt('0x' + hex.slice(1, 3)) / 255,
        parseInt('0x' + hex.slice(3, 5)) / 255,
        parseInt('0x' + hex.slice(5, 7)) / 255,
        1
    ]
}