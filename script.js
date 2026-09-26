/* ============================================================
   SCP: CONTAINMENT — GAME ENGINE
   script.js
   ============================================================ */

"use strict";

/* ============================================================
   GLOBAL GAME STATE
   ============================================================ */

const Game = {
    mode: "STORY",
    role: "GUARD",
    scp: null,

    running: false,
    paused: false,

    securityLevel: 0,
    power: 100,

    floor: 0,

    time: 0,
    playTime: 0,

    player: null,
    camera: null,
    scene: null,
    renderer: null,

    clock: new THREE.Clock(),

    keys: {},
    mouse: {
        x: 0,
        y: 0,
        locked: false
    },

    world: null,

    objects: {
        doors: [],
        npcs: [],
        scps: [],
        interactables: [],
        lights: [],
        cameras: []
    },

    inventory: [],
    objectives: [],

    settings: {
        sensitivity: 0.0022,
        fov: 75,
        headBob: true,
        flashlight: true
    },

    audio: {
        context: null,
        master: null
    }
};


/* ============================================================
   WORLD DATA
   ============================================================ */

const WorldData = {

    floors: [
        {
            id: 0,
            name: "GROUND",
            rooms: [
                {
                    id: "security",
                    name: "SECURITY",
                    x: -24,
                    z: 0,
                    w: 10,
                    d: 10,
                    type: "security"
                },

                {
                    id: "checkpoint",
                    name: "CHECKPOINT A",
                    x: -10,
                    z: 0,
                    w: 8,
                    d: 8,
                    type: "checkpoint"
                },

                {
                    id: "main",
                    name: "MAIN HALL",
                    x: 4,
                    z: 0,
                    w: 14,
                    d: 8,
                    type: "corridor"
                },

                {
                    id: "research",
                    name: "RESEARCH WING",
                    x: 24,
                    z: -12,
                    w: 14,
                    d: 12,
                    type: "research"
                },

                {
                    id: "medical",
                    name: "MEDICAL",
                    x: 24,
                    z: 12,
                    w: 14,
                    d: 12,
                    type: "medical"
                },

                {
                    id: "cells",
                    name: "D-CLASS BLOCK",
                    x: 48,
                    z: 0,
                    w: 14,
                    d: 20,
                    type: "cells"
                },

                {
                    id: "storage",
                    name: "STORAGE",
                    x: 24,
                    z: 30,
                    w: 12,
                    d: 10,
                    type: "storage"
                },

                {
                    id: "cafeteria",
                    name: "CAFETERIA",
                    x: -2,
                    z: 24,
                    w: 16,
                    d: 12,
                    type: "cafeteria"
                }
            ]
        },

        {
            id: 1,
            name: "RESEARCH",
            rooms: [
                {
                    id: "labs",
                    name: "LAB COMPLEX",
                    x: 0,
                    z: 0,
                    w: 20,
                    d: 16,
                    type: "research"
                },

                {
                    id: "office",
                    name: "ADMINISTRATION",
                    x: 25,
                    z: 0,
                    w: 14,
                    d: 12,
                    type: "office"
                },

                {
                    id: "server",
                    name: "SERVER ROOM",
                    x: -24,
                    z: 0,
                    w: 12,
                    d: 12,
                    type: "server"
                },

                {
                    id: "archives",
                    name: "ARCHIVES",
                    x: 0,
                    z: 24,
                    w: 18,
                    d: 12,
                    type: "archives"
                },

                {
                    id: "observation",
                    name: "OBSERVATION",
                    x: 28,
                    z: 24,
                    w: 16,
                    d: 12,
                    type: "observation"
                }
            ]
        },

        {
            id: 2,
            name: "CONTAINMENT",
            rooms: [
                {
                    id: "scp173",
                    name: "SCP-173 CONTAINMENT",
                    x: 0,
                    z: 0,
                    w: 18,
                    d: 18,
                    type: "containment"
                },

                {
                    id: "scp096",
                    name: "SCP-096 CONTAINMENT",
                    x: 28,
                    z: 0,
                    w: 18,
                    d: 18,
                    type: "containment"
                },

                {
                    id: "scp049",
                    name: "SCP-049 CONTAINMENT",
                    x: -28,
                    z: 0,
                    w: 18,
                    d: 18,
                    type: "containment"
                },

                {
                    id: "control",
                    name: "CONTAINMENT CONTROL",
                    x: 0,
                    z: 28,
                    w: 20,
                    d: 12,
                    type: "control"
                },

                {
                    id: "maintenance",
                    name: "MAINTENANCE",
                    x: -28,
                    z: 28,
                    w: 16,
                    d: 12,
                    type: "maintenance"
                }
            ]
        }
    ],

    corridors: [
        {
            floor: 0,
            x: -10,
            z: 0,
            w: 18,
            d: 5
        },

        {
            floor: 0,
            x: 12,
            z: 0,
            w: 18,
            d: 5
        },

        {
            floor: 0,
            x: 38,
            z: 0,
            w: 12,
            d: 5
        },

        {
            floor: 0,
            x: 4,
            z: 12,
            w: 5,
            d: 24
        },

        {
            floor: 1,
            x: 12,
            z: 0,
            w: 20,
            d: 5
        },

        {
            floor: 1,
            x: 0,
            z: 12,
            w: 5,
            d: 24
        },

        {
            floor: 2,
            x: 0,
            z: 12,
            w: 5,
            d: 24
        }
    ],

    elevators: [
        {
            id: "elevatorA",
            x: -18,
            z: 0,
            floors: [0, 1, 2]
        }
    ]
};


/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

function distance2D(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "";
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}


/* ============================================================
   AUDIO
   ============================================================ */

function initAudio() {

    if (Game.audio.context) return;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const ctx = new AudioContext();

        const master = ctx.createGain();
        master.gain.value = 0.08;

        master.connect(ctx.destination);

        Game.audio.context = ctx;
        Game.audio.master = master;

    } catch (error) {
        console.warn("Audio unavailable:", error);
    }
}


function playTone(frequency = 440, duration = 0.1, type = "sine") {

    if (!Game.audio.context) return;

    const ctx = Game.audio.context;

    if (ctx.state === "suspended") {
        ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.0001,
        ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.15,
        ctx.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(Game.audio.master);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}


/* ============================================================
   THREE.JS INITIALIZATION
   ============================================================ */

function initThree() {

    Game.scene = new THREE.Scene();

    Game.scene.background =
        new THREE.Color(0x05070a);

    Game.scene.fog =
        new THREE.FogExp2(0x05070a, 0.018);


    Game.camera =
        new THREE.PerspectiveCamera(
            Game.settings.fov,
            window.innerWidth / window.innerHeight,
            0.05,
            500
        );


    Game.renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });

    Game.renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    Game.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    Game.renderer.shadowMap.enabled = true;

    Game.renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    const container =
        document.getElementById("game-container");

    if (container) {

        container.innerHTML = "";

        container.appendChild(
            Game.renderer.domElement
        );

    } else {

        document.body.appendChild(
            Game.renderer.domElement
        );

    }


    window.addEventListener(
        "resize",
        onResize
    );
}


function onResize() {

    if (!Game.camera || !Game.renderer) return;

    Game.camera.aspect =
        window.innerWidth / window.innerHeight;

    Game.camera.updateProjectionMatrix();

    Game.renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* ============================================================
   LIGHTING
   ============================================================ */

function createLighting() {

    const ambient =
        new THREE.HemisphereLight(
            0x64748b,
            0x08090c,
            0.35
        );

    Game.scene.add(ambient);


    const emergency =
        new THREE.PointLight(
            0xff2020,
            0.7,
            16
        );

    emergency.position.set(
        0,
        3,
        0
    );

    Game.scene.add(emergency);


    for (let i = 0; i < 25; i++) {

        const light =
            new THREE.PointLight(
                0xaecbff,
                0.55,
                18
            );

        light.position.set(
            random(-45, 55),
            3.3,
            random(-25, 40)
        );

        light.castShadow = false;

        Game.scene.add(light);

        Game.objects.lights.push(light);
    }
}


/* ============================================================
   MATERIALS
   ============================================================ */

const Materials = {

    floor: new THREE.MeshStandardMaterial({
        color: 0x4c535c,
        roughness: 0.82,
        metalness: 0.15
    }),

    wall: new THREE.MeshStandardMaterial({
        color: 0x727985,
        roughness: 0.72,
        metalness: 0.08
    }),

    ceiling: new THREE.MeshStandardMaterial({
        color: 0x252a31,
        roughness: 0.9
    }),

    darkWall: new THREE.MeshStandardMaterial({
        color: 0x30343a,
        roughness: 0.85
    }),

    door: new THREE.MeshStandardMaterial({
        color: 0x171b20,
        metalness: 0.75,
        roughness: 0.32
    }),

    glass: new THREE.MeshStandardMaterial({
        color: 0x6c91a6,
        transparent: true,
        opacity: 0.28,
        metalness: 0.2,
        roughness: 0.1
    }),

    white: new THREE.MeshStandardMaterial({
        color: 0xdce1e7,
        roughness: 0.65
    }),

    black: new THREE.MeshStandardMaterial({
        color: 0x080a0c,
        roughness: 0.9
    })
};


/* ============================================================
   GEOMETRY HELPERS
   ============================================================ */

function createBox(
    width,
    height,
    depth,
    material,
    x,
    y,
    z,
    parent = Game.scene
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}


/* ============================================================
   FACILITY GENERATION
   ============================================================ */

function generateFacility() {

    clearWorld();

    const floorHeight = 8;

    for (
        let floorIndex = 0;
        floorIndex < WorldData.floors.length;
        floorIndex++
    ) {

        const floor =
            WorldData.floors[floorIndex];

        const y =
            floorIndex * floorHeight;


        for (const room of floor.rooms) {

            buildRoom(
                room,
                y
            );
        }
    }


    for (const corridor of WorldData.corridors) {

        buildCorridor(
            corridor,
            corridor.floor * floorHeight
        );
    }


    buildElevators();

    buildDoors();

    buildDecorations();

    buildCameras();

    spawnNPCs();

    spawnRole();

    setupObjectives();

    updateMap();
}


function clearWorld() {

    if (!Game.scene) return;

    while (Game.scene.children.length > 0) {

        Game.scene.remove(
            Game.scene.children[0]
        );
    }

    Game.objects.doors = [];
    Game.objects.npcs = [];
    Game.objects.scps = [];
    Game.objects.interactables = [];
    Game.objects.lights = [];
    Game.objects.cameras = [];
}


/* ============================================================
   ROOM BUILDING
   ============================================================ */

function buildRoom(room, y) {

    const wallHeight = 6;

    const floorY = y;

    createBox(
        room.w,
        0.2,
        room.d,
        Materials.floor,
        room.x,
        floorY,
        room.z
    );


    createBox(
        room.w,
        0.2,
        room.d,
        Materials.ceiling,
        room.x,
        floorY + wallHeight,
        room.z
    );


    createBox(
        room.w,
        wallHeight,
        0.35,
        Materials.wall,
        room.x,
        floorY + wallHeight / 2,
        room.z - room.d / 2
    );


    createBox(
        room.w,
        wallHeight,
        0.35,
        Materials.wall,
        room.x,
        floorY + wallHeight / 2,
        room.z + room.d / 2
    );


    createBox(
        0.35,
        wallHeight,
        room.d,
        Materials.wall,
        room.x - room.w / 2,
        floorY + wallHeight / 2,
        room.z
    );


    createBox(
        0.35,
        wallHeight,
        room.d,
        Materials.wall,
        room.x + room.w / 2,
        floorY + wallHeight / 2,
        room.z
    );


    createRoomSign(
        room,
        y
    );
}


function buildCorridor(corridor, y) {

    const wallHeight = 6;

    createBox(
        corridor.w,
        0.2,
        corridor.d,
        Materials.floor,
        corridor.x,
        y,
        corridor.z
    );


    createBox(
        corridor.w,
        0.2,
        corridor.d,
        Materials.ceiling,
        corridor.x,
        y + wallHeight,
        corridor.z
    );


    const horizontal =
        corridor.w > corridor.d;


    if (horizontal) {

        createBox(
            corridor.w,
            wallHeight,
            0.25,
            Materials.darkWall,
            corridor.x,
            y + wallHeight / 2,
            corridor.z - corridor.d / 2
        );

        createBox(
            corridor.w,
            wallHeight,
            0.25,
            Materials.darkWall,
            corridor.x,
            y + wallHeight / 2,
            corridor.z + corridor.d / 2
        );

    } else {

        createBox(
            0.25,
            wallHeight,
            corridor.d,
            Materials.darkWall,
            corridor.x - corridor.w / 2,
            y + wallHeight / 2,
            corridor.z
        );

        createBox(
            0.25,
            wallHeight,
            corridor.d,
            Materials.darkWall,
            corridor.x + corridor.w / 2,
            y + wallHeight / 2,
            corridor.z
        );
    }
}


/* ============================================================
   ROOM SIGNS
   ============================================================ */

function createRoomSign(room, y) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#101318";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#dce3ea";

    ctx.font =
        "bold 42px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        room.name,
        canvas.width / 2,
        78
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    const material =
        new THREE.MeshBasicMaterial({
            map: texture
        });

    const sign =
        new THREE.Mesh(
            new THREE.PlaneGeometry(3.2, 0.8),
            material
        );

    sign.position.set(
        room.x,
        y + 3.2,
        room.z - room.d / 2 - 0.21
    );

    sign.rotation.y = Math.PI;

    Game.scene.add(sign);
}


/* ============================================================
   DOORS
   ============================================================ */

function buildDoors() {

    const doorLocations = [

        {
            x: -17,
            y: 3,
            z: 0,
            rotation: 0,
            required: 1,
            name: "SECURITY ACCESS"
        },

        {
            x: 17,
            y: 3,
            z: 0,
            rotation: 0,
            required: 2,
            name: "RESEARCH ACCESS"
        },

        {
            x: 38,
            y: 3,
            z: 0,
            rotation: 0,
            required: 2,
            name: "D-CLASS ACCESS"
        },

        {
            x: 4,
            y: 3,
            z: 12,
            rotation: Math.PI / 2,
            required: 1,
            name: "LOWER WING"
        }
    ];


    for (const data of doorLocations) {

        createDoor(data);
    }
}


function createDoor(data) {

    const group =
        new THREE.Group();

    group.position.set(
        data.x,
        data.y,
        data.z
    );

    group.rotation.y =
        data.rotation || 0;


    const door =
        createBox(
            3,
            5.4,
            0.3,
            Materials.door,
            0,
            0,
            0,
            group
        );


    const panel =
        createBox(
            0.5,
            0.8,
            0.12,
            Materials.black,
            2,
            0,
            0.25,
            group
        );


    group.userData = {
        type: "door",
        name: data.name,
        requiredLevel: data.required,
        open: false,
        locked: true,
        targetY: data.y
    };


    Game.scene.add(group);

    Game.objects.doors.push(group);
}


function interactDoor(door) {

    if (!door) return;

    const required =
        door.userData.requiredLevel;

    const hasCard =
        Game.player.keycard >= required;

    if (!hasCard) {

        playTone(
            180,
            0.15,
            "square"
        );

        showMessage(
            `ACCESS DENIED — LEVEL ${required} KEYCARD REQUIRED`
        );

        return;
    }


    door.userData.open =
        !door.userData.open;

    door.userData.locked = false;

    playTone(
        door.userData.open ? 700 : 300,
        0.12,
        "square"
    );
}


/* ============================================================
   DECORATIONS
   ============================================================ */

function buildDecorations() {

    for (let i = 0; i < 35; i++) {

        const x =
            random(-40, 50);

        const z =
            random(-25, 35);

        const floor =
            randomInt(0, 2);

        const y =
            floor * 8;


        const crate =
            createBox(
                1.2,
                1.2,
                1.2,
                Materials.darkWall,
                x,
                y + 0.7,
                z
            );

        crate.userData.decoration = true;
    }


    for (let floor = 0; floor < 3; floor++) {

        for (let i = 0; i < 12; i++) {

            const x =
                random(-35, 45);

            const z =
                random(-20, 30);

            const light =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.4,
                        0.08,
                        0.3
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xbfd4ff
                    })
                );

            light.position.set(
                x,
                floor * 8 + 5.85,
                z
            );

            Game.scene.add(light);
        }
    }
}


/* ============================================================
   SECURITY CAMERAS
   ============================================================ */

function buildCameras() {

    const positions = [

        [-24, 5, 0],
        [4, 5, 0],
        [24, 5, -12],
        [48, 5, 0],
        [0, 13, 0],
        [28, 21, 24],
        [0, 21, 0],
        [28, 21, 0],
        [-28, 21, 0]
    ];


    positions.forEach(
        (position, index) => {

            const camera =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.35,
                        0.2,
                        0.6
                    ),
                    Materials.black
                );

            camera.position.set(
                position[0],
                position[1],
                position[2]
            );

            Game.scene.add(camera);

            Game.objects.cameras.push({
                id: index + 1,
                mesh: camera,
                active: true
            });
        }
    );
}


/* ============================================================
   PLAYER
   ============================================================ */

class Player {

    constructor(role) {

        this.role = role;

        this.position =
            new THREE.Vector3(
                -30,
                1.7,
                0
            );

        this.velocity =
            new THREE.Vector3();

        this.yaw = 0;
        this.pitch = 0;

        this.speed = 4.5;
        this.sprintSpeed = 7.5;

        this.height = 1.7;

        this.crouching = false;

        this.flashlight = true;

        this.keycard =
            role === "GUARD" ? 3 : 0;

        this.stamina = 100;

        this.health = 100;

        this.canMove = true;

        this.headBobTime = 0;

        this.spawn();
    }


    spawn() {

        if (this.role === "GUARD") {

            this.position.set(
                -28,
                1.7,
                0
            );

        }

        if (this.role === "D-CLASS") {

            this.position.set(
                48,
                1.7,
                0
            );

        }

        if (this.role === "SCP") {

            this.position.set(
                0,
                9.7,
                0
            );
        }


        Game.camera.position.copy(
            this.position
        );
    }


    update(delta) {

        if (!this.canMove) return;

        if (this.role === "SCP") {

            this.updateSCP(delta);
            return;
        }


        const direction =
            new THREE.Vector3();

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            );

        const right =
            new THREE.Vector3(
                1,
                0,
                0
            );


        forward.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.yaw
        );

        right.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.yaw
        );


        if (Game.keys["KeyW"])
            direction.add(forward);

        if (Game.keys["KeyS"])
            direction.sub(forward);

        if (Game.keys["KeyD"])
            direction.add(right);

        if (Game.keys["KeyA"])
            direction.sub(right);


        if (direction.lengthSq() > 0) {

            direction.normalize();

            let speed = this.speed;

            const sprinting =
                Game.keys["ShiftLeft"] ||
                Game.keys["ShiftRight"];

            if (
                sprinting &&
                this.stamina > 0 &&
                !this.crouching
            ) {

                speed =
                    this.sprintSpeed;

                this.stamina -=
                    delta * 20;

            } else {

                this.stamina +=
                    delta * 12;
            }


            this.stamina =
                clamp(
                    this.stamina,
                    0,
                    100
                );


            this.velocity.x =
                direction.x * speed;

            this.velocity.z =
                direction.z * speed;

        } else {

            this.velocity.x *= 0.78;
            this.velocity.z *= 0.78;

            this.stamina +=
                delta * 18;

            this.stamina =
                clamp(
                    this.stamina,
                    0,
                    100
                );
        }


        if (Game.keys["ControlLeft"] ||
            Game.keys["KeyC"]) {

            this.crouching = true;

        } else {

            this.crouching = false;
        }


        const targetHeight =
            this.crouching ? 1.05 : 1.7;

        this.height =
            lerp(
                this.height,
                targetHeight,
                delta * 10
            );


        this.position.x +=
            this.velocity.x * delta;

        this.position.z +=
            this.velocity.z * delta;


        this.resolveCollisions();


        const floor =
            Game.floor * 8;

        this.position.y =
            floor + this.height;


        Game.camera.position.copy(
            this.position
        );


        if (Game.settings.headBob &&
            direction.lengthSq() > 0) {

            this.headBobTime +=
                delta *
                (this.crouching ? 5 : 9);

            Game.camera.position.y +=
                Math.sin(
                    this.headBobTime
                ) * 0.025;
        }


        updateHUD();
    }


    resolveCollisions() {

        const radius = 0.45;

        for (
            const door of Game.objects.doors
        ) {

            if (door.userData.open)
                continue;

            const local =
                this.position.clone();

            local.sub(
                door.position
            );

            local.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                -door.rotation.y
            );


            if (
                Math.abs(local.x) < 1.7 &&
                Math.abs(local.z) < 0.65
            ) {

                if (local.z > 0) {

                    local.z =
                        0.7 + radius;

                } else {

                    local.z =
                        -0.7 - radius;
                }


                local.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    door.rotation.y
                );

                this.position.x =
                    door.position.x + local.x;

                this.position.z =
                    door.position.z + local.z;
            }
        }


        this.position.x =
            clamp(
                this.position.x,
                -55,
                65
            );

        this.position.z =
            clamp(
                this.position.z,
                -35,
                45
            );
    }


    updateSCP(delta) {

        if (!Game.scpController)
            return;

        Game.scpController.update(
            delta
        );
    }


    look(dx, dy) {

        this.yaw -=
            dx * Game.settings.sensitivity;

        this.pitch -=
            dy * Game.settings.sensitivity;

        this.pitch =
            clamp(
                this.pitch,
                -Math.PI / 2 + 0.05,
                Math.PI / 2 - 0.05
            );


        Game.camera.rotation.order =
            "YXZ";

        Game.camera.rotation.y =
            this.yaw;

        Game.camera.rotation.x =
            this.pitch;
    }
}


/* ============================================================
   SCP CONTROLLERS
   ============================================================ */

class SCPController {

    constructor(type) {

        this.type = type;

        this.mesh = null;

        this.target = null;

        this.cooldown = 0;

        this.state = "IDLE";

        this.create();
    }


    create() {

        if (this.type === "173")
            this.create173();

        if (this.type === "096")
            this.create096();

        if (this.type === "049")
            this.create049();
    }


    create173() {

        const group =
            new THREE.Group();

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.1,
                    2.4,
                    0.7
                ),
                Materials.wall
            );

        body.position.y = 1.2;

        group.add(body);


        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.48,
                    12,
                    12
                ),
                Materials.wall
            );

        head.position.y = 2.75;

        group.add(head);


        this.mesh = group;

        Game.scene.add(group);

        Game.objects.scps.push(group);
    }


    create096() {

        const group =
            new THREE.Group();

        const body =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.45,
                    1.8,
                    6,
                    12
                ),
                Materials.white
            );

        body.position.y = 1.45;

        group.add(body);


        const head =
            new THREE.SphereGeometry(
                0.38,
                12,
                12
            );

        const headMesh =
            new THREE.Mesh(
                head,
                Materials.white
            );

        headMesh.position.y = 2.75;

        group.add(headMesh);


        this.mesh = group;

        Game.scene.add(group);

        Game.objects.scps.push(group);
    }


    create049() {

        const group =
            new THREE.Group();

        const robe =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.8,
                    2.5,
                    8
                ),
                Materials.black
            );

        robe.position.y = 1.3;

        group.add(robe);


        const mask =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.35,
                    0.7,
                    8
                ),
                Materials.white
            );

        mask.rotation.x =
            Math.PI / 2;

        mask.position.y = 2.75;

        group.add(mask);


        this.mesh = group;

        Game.scene.add(group);

        Game.objects.scps.push(group);
    }


    update(delta) {

        if (!this.mesh) return;

        if (this.type === "173")
            this.update173(delta);

        if (this.type === "096")
            this.update096(delta);

        if (this.type === "049")
            this.update049(delta);
    }


    update173(delta) {

        const player =
            Game.player;

        if (!player) return;


        const target =
            player.position;

        const distance =
            this.mesh.position.distanceTo(
                target
            );


        if (distance > 1.5) {

            const watching =
                isPlayerLookingAt(
                    this.mesh.position
                );

            if (!watching) {

                const direction =
                    new THREE.Vector3()
                        .subVectors(
                            target,
                            this.mesh.position
                        );

                direction.y = 0;

                if (direction.lengthSq() > 0) {

                    direction.normalize();

                    const speed =
                        distance > 12
                            ? 5.5
                            : 8;

                    this.mesh.position.add(
                        direction.multiplyScalar(
                            speed * delta
                        )
                    );
                }
            }
        }


        if (distance < 2) {

            showMessage(
                "SCP-173 IS VERY CLOSE"
            );
        }
    }


    update096(delta) {

        const player =
            Game.player;

        if (!player) return;


        const distance =
            this.mesh.position.distanceTo(
                player.position
            );


        if (
            distance < 18 &&
            isPlayerLookingAt(
                this.mesh.position
            )
        ) {

            if (this.state === "IDLE") {

                this.state = "AGITATED";

                showMessage(
                    "SCP-096 HAS BEEN AGITATED"
                );

                playTone(
                    90,
                    0.6,
                    "sawtooth"
                );
            }
        }


        if (
            this.state === "AGITATED" ||
            this.state === "CHASING"
        ) {

            this.state = "CHASING";

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        this.mesh.position
                    );

            direction.y = 0;

            if (direction.lengthSq() > 0) {

                direction.normalize();

                this.mesh.position.add(
                    direction.multiplyScalar(
                        4.5 * delta
                    )
                );
            }


            if (distance < 2) {

                gameOver(
                    "SCP-096 REACHED YOU"
                );
            }
        }
    }


    update049(delta) {

        const player =
            Game.player;

        if (!player) return;


        const distance =
            this.mesh.position.distanceTo(
                player.position
            );


        if (distance < 14) {

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        this.mesh.position
                    );

            direction.y = 0;

            if (direction.lengthSq() > 0) {

                direction.normalize();

                this.mesh.position.add(
                    direction.multiplyScalar(
                        2.0 * delta
                    )
                );
            }
        }


        if (distance < 2) {

            showMessage(
                "SCP-049 HAS FOUND YOU"
            );
        }
    }
}


/* ============================================================
   LOOK DETECTION
   ============================================================ */

function isPlayerLookingAt(position) {

    if (!Game.camera)
        return false;

    const direction =
        new THREE.Vector3()
            .subVectors(
                position,
                Game.camera.position
            )
            .normalize();


    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    forward.applyQuaternion(
        Game.camera.quaternion
    );


    const dot =
        forward.dot(direction);


    return dot > 0.88;
}


/* ============================================================
   SCP SPAWN
   ============================================================ */

function spawnSCP(type) {

    if (!type) return;

    Game.scpController =
        new SCPController(type);

    if (type === "173") {

        Game.scpController.mesh.position.set(
            0,
            0,
            0
        );
    }

    if (type === "096") {

        Game.scpController.mesh.position.set(
            28,
            8,
            0
        );
    }

    if (type === "049") {

        Game.scpController.mesh.position.set(
            -28,
            16,
            0
        );
    }
}


/* ============================================================
   NPC SYSTEM
   ============================================================ */

class NPC {

    constructor(type, x, y, z) {

        this.type = type;

        this.position =
            new THREE.Vector3(
                x,
                y,
                z
            );

        this.target =
            new THREE.Vector3(
                x + random(-10, 10),
                y,
                z + random(-10, 10)
            );

        this.speed =
            type === "GUARD"
                ? 2.4
                : 1.5;

        this.state = "PATROL";

        this.mesh =
            this.createMesh();

        Game.scene.add(
            this.mesh
        );

        Game.objects.npcs.push(
            this
        );
    }


    createMesh() {

        const group =
            new THREE.Group();


        let material =
            Materials.white;


        if (this.type === "GUARD")
            material = Materials.darkWall;

        if (this.type === "D-CLASS")
            material = new THREE.MeshStandardMaterial({
                color: 0xd47a45
            });


        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.7,
                    1.4,
                    0.45
                ),
                material
            );

        body.position.y = 0.7;

        group.add(body);


        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.28,
                    10,
                    10
                ),
                Materials.white
            );

        head.position.y = 1.65;

        group.add(head);


        group.position.copy(
            this.position
        );

        return group;
    }


    update(delta) {

        if (!Game.player)
            return;


        const direction =
            new THREE.Vector3()
                .subVectors(
                    this.target,
                    this.position
                );

        direction.y = 0;


        if (direction.length() < 1) {

            this.target.set(
                this.position.x +
                    random(-12, 12),

                this.position.y,

                this.position.z +
                    random(-12, 12)
            );

            return;
        }


        direction.normalize();


        this.position.add(
            direction.multiplyScalar(
                this.speed * delta
            )
        );


        this.mesh.position.copy(
            this.position
        );
    }
}


function spawnNPCs() {

    const spawns = [

        ["GUARD", -22, 0, 0],
        ["GUARD", 5, 0, 0],
        ["GUARD", 30, 0, -12],
        ["D-CLASS", 48, 0, -5],
        ["D-CLASS", 48, 0, 5],
        ["SCIENTIST", 24, 8, -12],
        ["SCIENTIST", 0, 8, 0],
        ["TECHNICIAN", -24, 8, 0]
    ];


    for (const spawn of spawns) {

        new NPC(
            spawn[0],
            spawn[1],
            spawn[2],
            spawn[3]
        );
    }
}


/* ============================================================
   OBJECTIVES
   ============================================================ */

function setupObjectives() {

    Game.objectives = [];


    if (Game.role === "GUARD") {

        Game.objectives.push(
            {
                id: "security",
                text: "Reach Security",
                complete: false
            },

            {
                id: "checkpoint",
                text: "Check the containment status",
                complete: false
            },

            {
                id: "breach",
                text: "Investigate the facility breach",
                complete: false
            }
        );
    }


    if (Game.role === "D-CLASS") {

        Game.objectives.push(
            {
                id: "escape",
                text: "Find a way out of the D-Class block",
                complete: false
            },

            {
                id: "keycard",
                text: "Find an access keycard",
                complete: false
            },

            {
                id: "exit",
                text: "Reach the facility exit",
                complete: false
            }
        );
    }


    if (Game.role === "SCP") {

        Game.objectives.push(
            {
                id: "escape",
                text: "Escape containment",
                complete: false
            },

            {
                id: "facility",
                text: "Explore the facility",
                complete: false
            }
        );
    }


    updateObjectives();
}


function updateObjectives() {

    const container =
        document.getElementById(
            "objectives"
        );

    if (!container)
        return;


    container.innerHTML = "";


    for (
        const objective
        of Game.objectives
    ) {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            objective.complete
                ? "objective complete"
                : "objective";


        div.textContent =
            `${objective.complete ? "✓" : "○"} ${objective.text}`;

        container.appendChild(div);
    }
}


function completeObjective(id) {

    const objective =
        Game.objectives.find(
            obj => obj.id === id
        );

    if (!objective) return;

    objective.complete = true;

    updateObjectives();

    playTone(
        700,
        0.15,
        "sine"
    );
}


/* ============================================================
   INTERACTION
   ============================================================ */

function interact() {

    if (!Game.player)
        return;


    const origin =
        Game.camera.position.clone();

    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    direction.applyQuaternion(
        Game.camera.quaternion
    );


    const raycaster =
        new THREE.Raycaster(
            origin,
            direction,
            0,
            4
        );


    const meshes = [];


    for (
        const door
        of Game.objects.doors
    ) {

        meshes.push(
            ...door.children
        );
    }


    const hits =
        raycaster.intersectObjects(
            meshes,
            true
        );


    if (hits.length > 0) {

        let object =
            hits[0].object;


        while (
            object.parent &&
            !object.userData.type
        ) {

            object =
                object.parent;
        }


        if (
            object.userData &&
            object.userData.type === "door"
        ) {

            interactDoor(object);
            return;
        }
    }


    showMessage(
        "NOTHING TO INTERACT WITH"
    );
}


/* ============================================================
   FLASHLIGHT
   ============================================================ */

let flashlightObject = null;

function createFlashlight() {

    flashlightObject =
        new THREE.SpotLight(
            0xffffff,
            3.0,
            28,
            Math.PI / 7,
            0.5,
            1.2
        );

    flashlightObject.castShadow = true;

    Game.camera.add(
        flashlightObject
    );

    flashlightObject.position.set(
        0,
        -0.05,
        -0.1
    );

    flashlightObject.target.position.set(
        0,
        0,
        -10
    );

    Game.camera.add(
        flashlightObject.target
    );
}


function toggleFlashlight() {

    if (!flashlightObject)
        return;

    Game.player.flashlight =
        !Game.player.flashlight;

    flashlightObject.visible =
        Game.player.flashlight;

    playTone(
        Game.player.flashlight
            ? 900
            : 300,
        0.06,
        "square"
    );
}


/* ============================================================
   SECURITY SYSTEM
   ============================================================ */

function raiseSecurity(level) {

    Game.securityLevel =
        clamp(
            level,
            0,
            4
        );


    const names = [
        "NORMAL",
        "ELEVATED",
        "BREACH",
        "LOCKDOWN",
        "CRITICAL"
    ];


    setText(
        "security-status",
        names[Game.securityLevel]
    );


    if (Game.securityLevel >= 2) {

        for (
            const light
            of Game.objects.lights
        ) {

            light.color.setHex(
                0xff5555
            );
        }
    }
}


/* ============================================================
   POWER SYSTEM
   ============================================================ */

function updatePower(delta) {

    if (!Game.running)
        return;


    Game.power -=
        delta * 0.015;


    if (Game.securityLevel >= 2) {

        Game.power -=
            delta * 0.025;
    }


    Game.power =
        clamp(
            Game.power,
            0,
            100
        );


    setText(
        "power-value",
        `${Math.round(Game.power)}%`
    );


    if (Game.power <= 0) {

        disableFacilityPower();
    }
}


function disableFacilityPower() {

    for (
        const light
        of Game.objects.lights
    ) {

        light.intensity *= 0.3;
    }


    if (flashlightObject)
        flashlightObject.intensity = 4;

    showMessage(
        "FACILITY POWER FAILURE"
    );
}


/* ============================================================
   MAP
   ============================================================ */

function updateMap() {

    const map =
        document.getElementById(
            "map"
        );

    if (!map)
        return;


    map.innerHTML = "";


    const rooms =
        WorldData
            .floors[Game.floor]
            .rooms;


    for (const room of rooms) {

        const node =
            document.createElement(
                "div"
            );

        node.className =
            "map-room";

        node.textContent =
            room.name;


        node.style.left =
            `${50 + room.x * 1.2}px`;

        node.style.top =
            `${50 + room.z * 1.2}px`;


        map.appendChild(
            node
        );
    }


    const playerMarker =
        document.createElement(
            "div"
        );

    playerMarker.className =
        "map-player";


    map.appendChild(
        playerMarker
    );
}


function toggleMap() {

    const mapPanel =
        document.getElementById(
            "map-panel"
        );

    if (!mapPanel)
        return;


    mapPanel.classList.toggle(
        "visible"
    );


    updateMap();
}


/* ============================================================
   HUD
   ============================================================ */

function updateHUD() {

    if (!Game.player)
        return;


    setText(
        "stamina-value",
        `${Math.round(Game.player.stamina)}%`
    );


    setText(
        "health-value",
        `${Math.round(Game.player.health)}%`
    );


    setText(
        "keycard-value",
        Game.player.keycard > 0
            ? `LEVEL ${Game.player.keycard}`
            : "NONE"
    );
}


function showMessage(message) {

    const el =
        document.getElementById(
            "message"
        );

    if (!el)
        return;


    el.textContent =
        message;

    el.classList.add(
        "visible"
    );


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(
            () => {

                el.classList.remove(
                    "visible"
                );

            },
            2800
        );
}


/* ============================================================
   GAME START
   ============================================================ */

function startGame() {

    initAudio();

    if (
        Game.audio.context &&
        Game.audio.context.state === "suspended"
    ) {

        Game.audio.context.resume();
    }


    hideElement("main-menu");
    hideElement("role-menu");
    hideElement("scp-menu");
    hideElement("settings-menu");
    hideElement("controls-menu");


    showElement("hud");


    if (!Game.renderer) {

        initThree();
    }


    createLighting();

    generateFacility();


    Game.player =
        new Player(
            Game.role
        );


    if (Game.role === "SCP") {

        spawnSCP(
            Game.scp || "173"
        );
    }


    createFlashlight();

    Game.running = true;
    Game.paused = false;

    Game.clock.start();

    requestPointerLock();

    showMessage(
        `MISSION STARTED — ${Game.role}`
    );
}


/* ============================================================
   MENU SYSTEM
   ============================================================ */

function showMenu(menuId) {

    const menus = [
        "main-menu",
        "role-menu",
        "scp-menu",
        "settings-menu",
        "controls-menu"
    ];


    menus.forEach(
        id => hideElement(id)
    );


    showElement(menuId);
}


function selectMode(mode) {

    Game.mode =
        mode;

    showMenu(
        "role-menu"
    );
}


function selectRole(role) {

    Game.role =
        role;

    if (role === "SCP") {

        showMenu(
            "scp-menu"
        );

    } else {

        startGame();
    }
}


function selectSCP(scp) {

    Game.scp =
        scp;

    startGame();
}


/* ============================================================
   PAUSE
   ============================================================ */

function togglePause() {

    if (!Game.running)
        return;


    Game.paused =
        !Game.paused;


    const pause =
        document.getElementById(
            "pause-menu"
        );


    if (pause) {

        pause.style.display =
            Game.paused
                ? "flex"
                : "none";
    }


    if (Game.paused) {

        document.exitPointerLock();

    } else {

        requestPointerLock();
    }
}


function exitToMenu() {

    Game.running = false;
    Game.paused = false;

    document.exitPointerLock();

    if (Game.renderer) {

        const canvas =
            Game.renderer.domElement;

        if (canvas.parentNode) {

            canvas.parentNode.removeChild(
                canvas
            );
        }

        Game.renderer.dispose();

        Game.renderer = null;
    }


    Game.scene = null;
    Game.camera = null;

    showMenu(
        "main-menu"
    );

    hideElement("hud");
    hideElement("pause-menu");
}


/* ============================================================
   POINTER LOCK
   ============================================================ */

function requestPointerLock() {

    if (!Game.renderer)
        return;

    Game.renderer.domElement.requestPointerLock();
}


document.addEventListener(
    "pointerlockchange",
    () => {

        Game.mouse.locked =
            document.pointerLockElement ===
            Game.renderer?.domElement;
    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (
            !Game.running ||
            Game.paused ||
            !Game.mouse.locked ||
            !Game.player
        )
            return;


        if (
            Game.role === "SCP"
        ) {

            Game.player.look(
                event.movementX,
                event.movementY
            );

        } else {

            Game.player.look(
                event.movementX,
                event.movementY
            );
        }
    }
);


/* ============================================================
   KEYBOARD
   ============================================================ */

window.addEventListener(
    "keydown",
    event => {

        Game.keys[event.code] =
            true;


        if (
            event.code === "Escape" &&
            Game.running
        ) {

            togglePause();
        }


        if (
            event.code === "KeyF" &&
            Game.running
        ) {

            toggleFlashlight();
        }


        if (
            event.code === "KeyE" &&
            Game.running
        ) {

            interact();
        }


        if (
            event.code === "KeyM" &&
            Game.running
        ) {

            toggleMap();
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        Game.keys[event.code] =
            false;
    }
);


/* ============================================================
   GAME LOOP
   ============================================================ */

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    if (
        !Game.renderer ||
        !Game.scene ||
        !Game.camera
    )
        return;


    const delta =
        Math.min(
            Game.clock.getDelta(),
            0.05
        );


    if (
        Game.running &&
        !Game.paused
    ) {

        Game.time +=
            delta;

        Game.playTime +=
            delta;


        if (Game.player) {

            Game.player.update(
                delta
            );
        }


        for (
            const npc
            of Game.objects.npcs
        ) {

            npc.update(
                delta
            );
        }


        updatePower(
            delta
        );


        updateSecurityEvents(
            delta
        );
    }


    Game.renderer.render(
        Game.scene,
        Game.camera
    );
}


/* ============================================================
   RANDOM FACILITY EVENTS
   ============================================================ */

let securityEventTimer = 15;

function updateSecurityEvents(delta) {

    securityEventTimer -=
        delta;


    if (
        securityEventTimer <= 0
    ) {

        securityEventTimer =
            random(
                20,
                45
            );


        if (
            Game.securityLevel <
            4
        ) {

            const chance =
                Math.random();


            if (
                chance > 0.65
            ) {

                raiseSecurity(
                    Game.securityLevel + 1
                );


                showMessage(
                    "SECURITY ALERT — CONTAINMENT STATUS CHANGED"
                );


                playTone(
                    120,
                    0.3,
                    "square"
                );
            }
        }
    }
}


/* ============================================================
   GAME OVER
   ============================================================ */

function gameOver(reason) {

    if (!Game.running)
        return;


    Game.running = false;

    document.exitPointerLock();

    setText(
        "game-over-reason",
        reason
    );


    showElement(
        "game-over"
    );
}


/* ============================================================
   SAVE SYSTEM
   ============================================================ */

function saveGame() {

    if (!Game.player)
        return;


    const save = {

        mode: Game.mode,

        role: Game.role,

        scp: Game.scp,

        floor: Game.floor,

        power: Game.power,

        securityLevel:
            Game.securityLevel,

        position: {
            x: Game.player.position.x,
            y: Game.player.position.y,
            z: Game.player.position.z
        },

        stamina:
            Game.player.stamina,

        health:
            Game.player.health,

        keycard:
            Game.player.keycard,

        objectives:
            Game.objectives
    };


    localStorage.setItem(
        "scpContainmentSave",
        JSON.stringify(save)
    );


    showMessage(
        "GAME SAVED"
    );
}


function loadGame() {

    const raw =
        localStorage.getItem(
            "scpContainmentSave"
        );


    if (!raw) {

        showMessage(
            "NO SAVE DATA FOUND"
        );

        return;
    }


    try {

        const save =
            JSON.parse(raw);


        Game.mode =
            save.mode || "STORY";

        Game.role =
            save.role || "GUARD";

        Game.scp =
            save.scp || null;

        Game.floor =
            save.floor || 0;

        Game.power =
            save.power ?? 100;

        Game.securityLevel =
            save.securityLevel ?? 0;


        startGame();


        if (
            Game.player &&
            save.position
        ) {

            Game.player.position.set(
                save.position.x,
                save.position.y,
                save.position.z
            );
        }


        Game.player.stamina =
            save.stamina ?? 100;

        Game.player.health =
            save.health ?? 100;

        Game.player.keycard =
            save.keycard ?? 0;

        Game.objectives =
            save.objectives || [];


        updateObjectives();

        showMessage(
            "SAVE LOADED"
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "SAVE DATA IS CORRUPTED"
        );
    }
}


/* ============================================================
   SETTINGS
   ============================================================ */

function setSensitivity(value) {

    Game.settings.sensitivity =
        Number(value);

    localStorage.setItem(
        "scpSensitivity",
        Game.settings.sensitivity
    );
}


function setFOV(value) {

    Game.settings.fov =
        Number(value);


    if (Game.camera) {

        Game.camera.fov =
            Game.settings.fov;

        Game.camera.updateProjectionMatrix();
    }


    localStorage.setItem(
        "scpFOV",
        Game.settings.fov
    );
}


/* ============================================================
   FLOOR TRANSITION
   ============================================================ */

function changeFloor(newFloor) {

    newFloor =
        clamp(
            newFloor,
            0,
            WorldData.floors.length - 1
        );


    Game.floor =
        newFloor;


    if (Game.player) {

        Game.player.position.y =
            newFloor * 8 +
            Game.player.height;
    }


    updateMap();


    showMessage(
        `FLOOR ${newFloor + 1}: ${WorldData.floors[newFloor].name}`
    );
}


/* ============================================================
   ELEVATOR
   ============================================================ */

function buildElevators() {

    for (
        const elevator
        of WorldData.elevators
    ) {

        const shaft =
            createBox(
                4,
                24,
                4,
                Materials.darkWall,
                elevator.x,
                8,
                elevator.z
            );


        shaft.userData.type =
            "elevator";
    }
}


/* ============================================================
   GAME INITIALIZATION
   ============================================================ */

function initializeMenus() {

    showMenu(
        "main-menu"
    );

    hideElement("hud");
    hideElement("pause-menu");
    hideElement("game-over");


    const buttons =
        document.querySelectorAll(
            "[data-mode]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectMode(
                        button.dataset.mode
                    );
                }
            );
        }
    );


    const roleButtons =
        document.querySelectorAll(
            "[data-role]"
        );


    roleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectRole(
                        button.dataset.role
                    );
                }
            );
        }
    );


    const scpButtons =
        document.querySelectorAll(
            "[data-scp]"
        );


    scpButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectSCP(
                        button.dataset.scp
                    );
                }
            );
        }
    );


    const startButtons =
        document.querySelectorAll(
            "[data-action]"
        );


    startButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    if (
                        action === "continue"
                    ) {

                        startGame();
                    }


                    if (
                        action === "save"
                    ) {

                        saveGame();
                    }


                    if (
                        action === "load"
                    ) {

                        loadGame();
                    }


                    if (
                        action === "resume"
                    ) {

                        togglePause();
                    }


                    if (
                        action === "menu"
                    ) {

                        exitToMenu();
                    }


                    if (
                        action === "controls"
                    ) {

                        showMenu(
                            "controls-menu"
                        );
                    }


                    if (
                        action === "settings"
                    ) {

                        showMenu(
                            "settings-menu"
                        );
                    }


                    if (
                        action === "back"
                    ) {

                        showMenu(
                            "main-menu"
                        );
                    }
                }
            );
        }
    );


    const sensitivity =
        document.getElementById(
            "sensitivity"
        );

    if (sensitivity) {

        sensitivity.addEventListener(
            "input",
            () => {

                setSensitivity(
                    sensitivity.value
                );
            }
        );
    }


    const fov =
        document.getElementById(
            "fov"
        );

    if (fov) {

        fov.addEventListener(
            "input",
            () => {

                setFOV(
                    fov.value
                );
            }
        );
    }
}


/* ============================================================
   INITIAL START
   ============================================================ */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeMenus();

        gameLoop();
    }
);
