$(function () {
    //get canvas object
    var cvs = $("#simulator")[0];
    var ctx = cvs.getContext("2d");

    var cvs_choose_orb = $("#chooseOrb")[0];
    var ctx_choose_orb = cvs_choose_orb.getContext("2d");

    var mouseDown = false;
    var targetOrbPos = [0, 0];
    var targetOrbNum = 0;
    var BG_x_coor = [2, 86, 170, 254, 338, 422];
    var BG_y_coor = [1, 85, 169, 253, 337];

    var BG = new Image;
    var orbMap = ["火", "水", "木", "光", "暗", "心"];
    var orb = new Array();

    var steps;
    var path = "";
    //0:右 1:右上 2:上 3:左上 4:左 5:左下 6:下 7:右下
    var startPos = [0, 0];

    var enable_drop = false;
    var edit_mode = false;
    var enable_waiting = true;

    var combo = 0;
    var total_combo = 0;

    var edit_orb = 1;

    var raw_path_data_with_plane;

    var plane_attr = [
        [3, 5, 5, 1, 4, 2],
        [3, 2, 2, 5, 4, 2],
        [4, 4, 4, 6, 1, 1],
        [3, 5, 5, 2, 4, 2],
        [1, 1, 1, 5, 6, 6]
    ];

    function Plane(attr, visited, pos_x, pos_y) {
        this.attr = attr;
        this.visited = visited;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }

    var plane = new Array();

    for (var i = 0; i < 5; i++){
        plane[i] = new Array();
        for (var j = 0; j < 6; j++){
            plane[i][j] = new Plane(plane_attr[i][j],false,i,j);
        }
    }
    //retry記錄用
    var history_plane = _.cloneDeep(plane);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    function RandomGeneratePlane() {
        do{
            for (var i = 0; i < 5; i++){
                for (var j = 0; j < 6; j++){
                    plane[i][j].attr = Math.floor(Math.random() * 6 + 1);
                }
            }
        } while (check_combo(plane));
        history_plane = _.cloneDeep(plane);
    }

    function orbOnload() {
        for (var i = 0; i < 6; i++){
            for (var j = 0; j < 5; j++){
                if (plane_attr[j][i] === this.number) {
                    ctx.drawImage(this, BG_x_coor[i], BG_y_coor[j], 80, 80);
                }
            }
        }
        ctx_choose_orb.drawImage(this, BG_x_coor[Math.floor((this.number - 1) / 5)], BG_y_coor[(this.number - 1) % 5], 80, 80);
    };

    function swap(i1, j1, i2, j2) {
        if (i1 >= 0 && i1 < 6 && j1 >= 0 && j1 < 5 && i2 >= 0 && i2 < 6 && j2 >= 0 && j2 < 5) { 
            temp = plane[j1][i1].attr;
            plane[j1][i1].attr = plane[j2][i2].attr;
            plane[j2][i2].attr = temp;
            steps++;
            $("#steps_text").text("steps:" + steps);
        }
    }

    function drawOrb(disable_disappear) {
        for (var i = 0; i < 6; i++){
            for (var j = 0; j < 6; j++){
                for (var k = 0; k < 5; k++){
                    if (plane[k][j].attr === orb[i].number && ((targetOrbPos[0] != j || targetOrbPos[1] != k) || disable_disappear)) {
                        ctx.drawImage(orb[i], BG_x_coor[j], BG_y_coor[k], 80, 80);
                    }
                }
            }
        }
    }

    async function onReplay() {
        if (edit_mode === false && path !== "") {
            //disable click events
            $("#simulator").parent().css("pointer-events", "none");

            steps = 0;

            targetOrbPos[0] = startPos[0];
            targetOrbPos[1] = startPos[1];
            
            //recreate plane
            plane = _.cloneDeep(history_plane);
            ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
            drawOrb(true);

            enable_waiting = false;
            await sleep(500);
            enable_waiting = true;
            
            for (var i = 0; i < path.length; i++){
                switch (path.charAt(i)) {
                    case "0":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] + 1, targetOrbPos[1]);
                        targetOrbPos[0] += 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "1":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] + 1, targetOrbPos[1] - 1);
                        targetOrbPos[0] += 1;
                        targetOrbPos[1] -= 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "2":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0], targetOrbPos[1] - 1);
                        targetOrbPos[1] -= 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "3":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] - 1, targetOrbPos[1] - 1);
                        targetOrbPos[0] -= 1;
                        targetOrbPos[1] -= 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "4":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] - 1, targetOrbPos[1]);
                        targetOrbPos[0] -= 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "5":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] - 1, targetOrbPos[1] + 1);
                        targetOrbPos[0] -= 1;
                        targetOrbPos[1] += 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "6":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0], targetOrbPos[1] + 1);
                        targetOrbPos[1] += 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                    case "7":
                        swap(targetOrbPos[0], targetOrbPos[1], targetOrbPos[0] + 1, targetOrbPos[1] + 1);
                        targetOrbPos[0] += 1;
                        targetOrbPos[1] += 1;
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(false);
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(orb[targetOrbNum - 1], targetOrbPos[0] * 84 + 2, targetOrbPos[1] * 84 + 1, 80, 80);
                        ctx.restore();
                        await sleep(200);
                        break;
                }
            }
            $("#simulator").parent().css("pointer-events", "auto");
        }
    }

    function onMouseDown(evt) {
        if (edit_mode === false) {
            start_x = evt.pageX - cvs.offsetLeft;
            start_y = evt.pageY - cvs.offsetTop;
            targetOrbPos = [Math.floor((start_x - 2) / 84), Math.floor((start_y - 1) / 84)];
            startPos = targetOrbPos;
            targetOrbNum = plane[targetOrbPos[1]][targetOrbPos[0]].attr;
            mouseDown = true;
            total_combo = 0;
            $("#combo_text").text("combo:0");
            steps = 0;
            $("#steps_text").text("steps:" + steps);
            //clear last path.
            path = "";
        }
    }

    function onMouseMove(evt) {
        if (edit_mode === false) {
            if (mouseDown === true) {
                start_x = evt.pageX - cvs.offsetLeft;
                start_y = evt.pageY - cvs.offsetTop;
                currentPos = [Math.floor((start_x - 2) / 84), Math.floor((start_y - 1) / 84)];
                if (currentPos[0] != targetOrbPos[0] || currentPos[1] != targetOrbPos[1]) {
                    //x*3+y
                    switch ((currentPos[0]-targetOrbPos[0])*3+(currentPos[1]-targetOrbPos[1])) {
                        case 3:
                            path += "0";
                            break;
                        case 4:
                            path += "7";
                            break;
                        case 1:
                            path += "6";
                            break;
                        case -2:
                            path += "5";
                            break;
                        case -3:
                            path += "4";
                            break;
                        case -4:
                            path += "3";
                            break;
                        case -1:
                            path += "2";
                            break;
                        case 2:
                            path += "1";
                            break;
                        default:
                            alert("Error. You are not allow to CHEAT...");
                            break;
                    }
                    swap(currentPos[0], currentPos[1], targetOrbPos[0], targetOrbPos[1]);
                    targetOrbPos = currentPos;
                }
                ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                drawOrb(false);
                ctx.drawImage(orb[targetOrbNum - 1], start_x - 40, start_y - 40, 80, 80);
            }
        }
    }

    function onMouseUp(evt) {
        if (edit_mode === false) {
            if (mouseDown === true) {
                mouseDown = false;
                //disable click events
                $("#simulator").parent().css("pointer-events", "none");
                //copy path to final encode
                raw_path_data_with_plane = path;
                for (var i = 4; i >=0; i--) {
                    for (var j = 5; j >=0; j--) {
                        raw_path_data_with_plane = history_plane[i][j].attr.toString() + raw_path_data_with_plane;
                    }
                }

                end_x = evt.pageX - cvs.offsetLeft;
                end_y = evt.pageY - cvs.offsetTop;
                targetOrbPos = [Math.floor((end_x - 2) / 84), Math.floor((end_y - 1) / 84)];
                ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                drawOrb(false);
                ctx.drawImage(orb[targetOrbNum - 1], BG_x_coor[targetOrbPos[0]], BG_y_coor[targetOrbPos[1]], 80, 80);

                puzzle_elim(plane);
                //enable click events
            }
        }
    }

    function onMouseClick(evt) {
        if (edit_mode === true) {
            end_x = evt.pageX - cvs.offsetLeft;
            end_y = evt.pageY - cvs.offsetTop;
            targetOrbPos = [Math.floor((end_x - 2) / 84), Math.floor((end_y - 1) / 84)];
            plane[targetOrbPos[1]][targetOrbPos[0]].attr = edit_orb;
            ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
            drawOrb(true);
            history_plane = _.cloneDeep(plane);
        }
    }

    function onMouseClickChooseOrb(evt) {
        if (edit_mode === true) {
            ctx_choose_orb.clearRect(0, 0, cvs_choose_orb.width, cvs_choose_orb.height);
            for (var i = 0; i < 6; i++) {
                ctx_choose_orb.drawImage(orb[i], BG_x_coor[Math.floor((orb[i].number - 1) / 5)], BG_y_coor[(orb[i].number - 1) % 5], 80, 80);
            }
            end_x = evt.pageX - cvs_choose_orb.offsetLeft;
            end_y = evt.pageY - cvs_choose_orb.offsetTop;
            targetOrbPos = [Math.floor((end_x - 2) / 84), Math.floor((end_y - 1) / 84)];
            if (targetOrbPos[0] * 5 + targetOrbPos[1] + 1 <= 6) {
                edit_orb = targetOrbPos[0] * 5 + targetOrbPos[1] + 1;
            }
            ctx_choose_orb.beginPath();
            ctx_choose_orb.lineWidth = "0.5px";
            ctx_choose_orb.strokeStyle = "black";
            ctx_choose_orb.rect(84 * Math.floor((edit_orb - 1) / 5) + 1, (edit_orb - 1) % 5 * 84 + 1, 82, 82);
            ctx_choose_orb.stroke();
        }
    }

    function check_combo(plane) {
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 6; j++) {
                if (j + 2 < 6 && plane[i][j].attr !== 0 && plane[i][j].attr === plane[i][j + 1].attr && plane[i][j].attr === plane[i][j + 2].attr){
                    return true;
                }
                else if (i + 2 < 5 && plane[i][j].attr !== 0 && plane[i][j].attr === plane[i + 1][j].attr && plane[i][j].attr === plane[i + 2][j].attr){
                    return true;
                }
            }
        }
        return false;
    }    

    function generate_drop(plane){
        for(var i = 0; i < 5; i++){
            for(var j = 0; j < 6; j++){
                if(plane[i][j].attr === 0){
                    plane[i][j].attr = Math.floor(Math.random() * 6 + 1);
                }
            }
        }
        return plane;
    }

    async function puzzle_elim(plane) {
        do {
            combo = 0;
            for (var i = 0; i < 5; i++){
                for (var j = 0; j < 6; j++){
                    if (j + 2 < 6 && !plane[i][j].visited && plane[i][j].attr !== 0 && plane[i][j].attr === plane[i][j + 1].attr && plane[i][j].attr === plane[i][j + 2].attr) {
                        var delete_combo_handle = new Array();
                        delete_combo_handle.push(plane[i][j]);
                        var temp_combo_set = BFS_combo(plane, delete_combo_handle, new Array());
                        plane = Pop_combo(plane, temp_combo_set);
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(true);
                        combo++;
                        total_combo++;
                        $("#combo_text").text("combo:" + total_combo);
                        if (enable_waiting) {
                            await sleep(500);
                        }
                    }
                    else if (i + 2 < 5 && !plane[i][j].visited && plane[i][j].attr !== 0 && plane[i][j].attr === plane[i + 1][j].attr && plane[i][j].attr === plane[i + 2][j].attr) {
                        var delete_combo_handle = new Array();
                        delete_combo_handle.push(plane[i][j]);
                        var temp_combo_set = BFS_combo(plane, delete_combo_handle, new Array());
                        plane = Pop_combo(plane, temp_combo_set);
                        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                        drawOrb(true);
                        combo++;
                        total_combo++;
                        $("#combo_text").text("combo:" + total_combo);
                        if (enable_waiting) {
                            await sleep(500);
                        }
                    }
                }
            }
            plane = Drop(plane);
            ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
            drawOrb(true);
            if (enable_waiting) {
                await sleep(500);
            }

            if(enable_drop){
                plane = generate_drop(plane);
                ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
                drawOrb(true);
                if (enable_waiting) {
                    await sleep(500);
                }
            }

            for (var i = 0; i < 5; i++){
                for (var j = 0; j < 6; j++){
                    plane[i][j].visited = false;
                }
            }

        } while (combo != 0);
        $("#simulator").parent().css("pointer-events", "auto");
    }

    //setting src
    BG.src = "../img/轉珠盤面.png";
    for (var i = 0; i < 6; i++){
        orb[i] = new Image;
        orb[i].src = "../img/" + orbMap[i] + "珠.png";
        orb[i].number = i + 1;
    }
    //onload image
    BG.onload=function () {
        ctx.drawImage(this, 0, 0,cvs.width,cvs.height); 
    };
    for (var i = 0; i < 6; i++){
        orb[i].onload = orbOnload;
    }

    //add event listener
    cvs.addEventListener('mousedown', onMouseDown);
    cvs.addEventListener('mousemove', onMouseMove);
    cvs.addEventListener('mouseup', onMouseUp);
    cvs.addEventListener('mouseout', onMouseUp);
    cvs.addEventListener('click', onMouseClick);

    cvs_choose_orb.addEventListener('click', onMouseClickChooseOrb);
    
    $("#replay").on("click", onReplay);

    $("#randomGeneratePlane").on("click", function () {
        RandomGeneratePlane();
        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
        drawOrb(true);
    });

    $("#enableDrop").on("click", function () {
        if ($("#enableDrop").hasClass('active')) {
            enable_drop = false;
        }
        else {
            enable_drop = true;
        }
    });
    $("#retry").on("click", async function () {
        plane = _.cloneDeep(history_plane);
        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
        drawOrb(true);
        enable_waiting = false;
        await sleep(500); //wait enough time to let the puzzle_elim done its work.
        enable_waiting = true;
    });
    $("#editMode").on("click", function () {
        if ($("#editMode").hasClass('active')) {
            edit_mode = false;
            $("#chooseOrb").hide();
        }
        else {
            edit_mode = true;
            $("#chooseOrb").show();
        }
    })

    $("#copyPath").on("click", function () {
        //alert(raw_path_data_with_plane);
        $("#planeCode").val(raw_path_data_with_plane);
        $("#planeCode").select();
        document.execCommand("Copy");
    })
    $("#createPlane").on("click", function () {
        var planeCode = $("#planeCode").val();
        for (var i = 0; i < 5; i++){
            for (var j = 0; j < 6; j++){
                plane[i][j].attr = Number(planeCode[i * 6 + j]);
            }
        }
        history_plane = _.cloneDeep(plane);
        ctx.drawImage(BG, 0, 0, cvs.width, cvs.height);
        drawOrb(true);
        path = planeCode.slice(30);
    })

});