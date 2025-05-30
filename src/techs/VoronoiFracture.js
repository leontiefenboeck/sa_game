class Voronoi {
    constructor(numPoints,x,y) {
        this.num_points = numPoints,
        this.voronoi_points = [],
        this.voronoi_pixels = [],
        this.x = x,
        this.y = y
        this.width = 300,
        this.height = 300,
        this.maxDist = 0,
        this.offscreenCanvas = document.createElement("canvas"),
        this.offscreenCanvas.width = this.width,
        this.offscreenCanvas.height = this.height,
        this.offscreenCtx = this.offscreenCanvas.getContext("2d"),

        this.noise = [],
        this.gridSize = 30,
        this.scale = 20,
        this.noiseOverlay = false,

        this.verteces = [],
        this.radius = 150,
        this.meshDistances = [],

        this.combinedSDF = [],
        this.fragments = new Map(),
        this.fragmentObjects = [],
        this.imageData = 0,
        this.imageCanvas,
        this.fractured = false,
        this.displayPoints = false,
        this.displayDistanceField = false,
        this.animationRate = 60,
        this.fractured = false

    }
    getImage() {

        const img = document.getElementById("stopImage");

        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.width = img.width;
        this.imageCanvas.height = img.height;

        const ctx = this.imageCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        this.imageData = ctx.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);

    }


    createPoints()
    {

        for(let i = 0; i < this.num_points; i++)
        {
          
            const pointx = Math.random() * this.width * 0.9 + this.width * 0.05 + this.x;
            const pointy = Math.random() * this.height * 0.9 + this.height * 0.05 + this.y;
           
            this.voronoi_points.push({x: pointx,y: pointy });

        }
        this.createNoise();
    }

    createNoise() {
        const cols = Math.ceil(this.width / this.gridSize) + 1;
        const rows = Math.ceil(this.height / this.gridSize) + 1 ;

        let grid = [];
        for (let y = 0; y <= this.height; y+=this.gridSize) {
            const row = [];
            for (let x = 0; x <= this.width; x+=this.gridSize) {
                row.push(Math.random());
            }
            grid.push(row);

        }

        const lerp = (a, b, t) => a + (b - a) * t;
        const fade = t => t * t * (3 - 2 * t); 

        for (let y = 0; y < this.height; y++) {
            
            const gy = Math.floor(y / this.gridSize);
            const ty = fade((y % this.gridSize) / this.gridSize);

            const noiseRow = [];
            for (let x = 0; x < this.width ; x++) {
                const gx = Math.floor(x / this.gridSize);
                const tx = fade((x % this.gridSize) / this.gridSize);

                const a = grid[gy][gx];
                const b = grid[gy][gx + 1];
                const c = grid[gy + 1][gx];
                const d = grid[gy + 1][gx + 1];

                const top = lerp(a, b, tx);
                const bottom = lerp(c, d, tx);
                const value = lerp(top, bottom, ty); 

                noiseRow.push(value * this.scale);
            }

            this.noise.push(noiseRow);
        }

    }

    computeVoronoiDiagram()
    {
        for (var x = this.x; x < this.width + this.x; x++) {
            for (var y = this.y; y < this.height + this.y; y++) {

                let noiseX = x;
                let noiseY = y;
                if (this.noiseOverlay) {
                    noiseX += this.noise[Math.round(y - this.y)][Math.round(x - this.x)];
                    noiseY += this.noise[Math.round(y - this.y)][Math.round(x - this.x)];
                }

                let closest = 0;
                let minDist = Infinity;
                for (let i = 0; i < this.voronoi_points.length; i++) {
                    const p = this.voronoi_points[i];


                    const d2 = (p.x - noiseX) ** 2 + (p.y - noiseY) ** 2;

                    if (d2 < minDist) {
                        minDist = d2;
                        closest = i;
                    }
                }

                const pa = this.voronoi_points[closest];

                let closest_neighbour = 0;
                minDist = Infinity;

                for (var neighbour = 0; neighbour < this.voronoi_points.length; neighbour++) {
                    if (neighbour == closest) {
                        continue;
                    }
                    const pb = this.voronoi_points[neighbour];


                    let d = this.getDistanceToEdge(noiseX, noiseY, pa, pb);

                    if (Math.abs(d) < Math.abs(minDist)) {
                        minDist = d;
                        closest_neighbour = neighbour;
                    }
                }


                this.voronoi_pixels.push({ x, y, region: closest, distance: minDist });

            }
        }
        
        for (const p of this.voronoi_pixels) {
            if (p.distance > this.maxDist) {
                this.maxDist = p.distance;
            }
        }

        //this.createDistanceCanvas();
        //this.createFieldCanvas();

    }

    getDistanceToEdge(x,y,pa,pb) {
        const mx = (pa.x + pb.x) / 2;
        const my = (pa.y + pb.y) / 2;

        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        const vx = x - mx;
        const vy = y - my;


        const d = (vx * dx + vy * dy) / length;


        return d 

    }



    createMesh() {

        const centerx = this.x + this.width / 2;
        const centery = this.y + this.height / 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i + Math.PI) / 8;
            const x = centerx + this.radius * Math.cos(angle);
            const y = centery + this.radius * Math.sin(angle);
            this.verteces.push({ x, y });
        }
        this.meshSDF();
    }

    meshSDF() {

        for (var x = this.x; x < this.width + this.x; x++) {
            for (var y = this.y; y < this.height + this.y; y++) {

                let inside = true;
                let minDist = Infinity;

                for (let i = 0; i < this.verteces.length; i++) {
                    const a = this.verteces[i];
                    const b = this.verteces[(i + 1) % this.verteces.length];


                    const dist = this.pointToSegmentDistance(x,y, a, b);
                    if (dist < minDist) {
                        minDist = dist;
                    }


                    const edgeX = b.x - a.x;
                    const edgeY = b.y - a.y;
                    const pointX = x - a.x;
                    const pointY = y - a.y;

                    const cross = edgeX * pointY - edgeY * pointX;
                    if (cross < 0) {
                        inside = false;
                    }
                }
                
                this.meshDistances.push({ x, y, distance: inside ? -minDist : minDist });
                

            }
        }
        //this.createMeshCanvas();

        this.combineSDF();
        this.createCombinedCanvas();
        //this.createFragmentCanvas();
    }

    pointToSegmentDistance(x, y, a, b) {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const apx = x - a.x;
        const apy = y - a.y;

        const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));

        const closestX = a.x + t * abx;
        const closestY = a.y + t * aby;

        const dx = x - closestX;
        const dy = y - closestY;

        return Math.sqrt(dx * dx + dy * dy);
    }

    combineSDF() {
        //do intersection
        for (var i = 0; i < this.meshDistances.length; i++) {
            this.combinedSDF.push({
                x: this.meshDistances[i].x,
                y: this.meshDistances[i].y,
                distance: Math.max(this.meshDistances[i].distance, this.voronoi_pixels[i].distance)
            });
        }

        //set regions of pixels
        for (let i = 0; i < this.combinedSDF.length; i++) {
            const p = this.combinedSDF[i];
            if (p.distance < 0) { 
                
                const region = this.voronoi_pixels[i].region;
                if (!this.fragments.has(region)) {
                    this.fragments.set(region, []);
                    
                }
                this.fragments.get(region).push({ x: p.x, y: p.y });
            }
        }

        const sourceImageData = this.imageData.data;
        //set color values of regions onto canvases
        for (let [region, pixels] of this.fragments) {
            const fragmentCanvas = document.createElement("canvas");
            fragmentCanvas.width = this.width;
            fragmentCanvas.height = this.height;

            const ctx = fragmentCanvas.getContext("2d");
            const imageData = ctx.getImageData(0, 0, this.width, this.height);
            const data = imageData.data;
            

            for (let p of pixels) {
                const index = ((p.y - this.y) * this.width + (p.x - this.x)) * 4;
                const imageIndex = ((p.y - this.y) * this.imageCanvas.width  + (p.x - this.x)) * 4;

                data[index] = sourceImageData[imageIndex];    
                data[index + 1] = sourceImageData[imageIndex + 1]; 
                data[index + 2] = sourceImageData[imageIndex + 2]; 
                data[index + 3] = sourceImageData[imageIndex + 3]; 
            }
            ctx.putImageData(imageData, 0, 0);
            this.fragments.set(region, { canvas: fragmentCanvas, pixels });
        }

        //create fragmentObjects
        for (let [region, { canvas }] of this.fragments) {
            this.fragmentObjects.push({
                canvas,
                x: this.x,
                y: this.y,
                vx: 0,
                vy: 0,
                angle: 0,
                va: 0
            });
        }
    }

    checkForHit(x,y)
    {
        if(!this.fractured && Math.abs(x - this.x - this.width/2) < this.radius - 15 && Math.abs(y - this.y-  this.height/2) < this.radius  - 15)
        {
            this.hit();
            this.fractured = true;
        }
    }
    hit() {

        fractureObject.createPoints();
        fractureObject.computeVoronoiDiagram();
        fractureObject.createMesh();

        for (var i = 0; i < this.fragmentObjects.length; i++) {
            this.fragmentObjects[i].vx = (Math.random() - 0.5) ;
            this.fragmentObjects[i].vy = (Math.random() - 0.5);
            this.fragmentObjects[i].angle = 0;
            this.fragmentObjects[i].va = (Math.random() - 0.5) * 0.001 ;
        }
        this.fractured = true;
    }

    createDistanceCanvas() {
        let ctx = this.offscreenCtx;
        for (const { x, y, region, distance } of this.voronoi_pixels) {

            const norm = Math.min(Math.abs(distance) / 40, 1);

            const r = Math.floor(255 * (1 - norm));
            const g = Math.floor(255 * norm);
            const b = 0;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x - this.x, y - this.y, 1, 1);
        }
    }
    createFieldCanvas() {
        let ctx = this.offscreenCtx;

        for (const { x, y, region } of this.voronoi_pixels) {
            const r = region * 50 % 256; 
            const g = region * 80 % 256;
            const b = region * 110 % 256;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x - this.x, y - this.y, 1, 1);
        }
    }
    createMeshCanvas() {
        let ctx = this.offscreenCtx;
        
        for (const { x, y, distance } of this.meshDistances) {
            const norm = Math.min(Math.abs(distance) / 200, 1);

            const r = Math.floor(255 * norm);
            const g = Math.floor(255 * (1 - norm));
            const b = 0;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x - this.x, y - this.y, 1, 1);
        }
    }
    createCombinedCanvas() {
        let ctx = this.offscreenCtx;

        for (const { x,y, distance } of this.combinedSDF) {

            const norm = Math.min(Math.abs(distance) / 20, 1);

            const r = Math.floor(255 * (1 - norm));
            const g = Math.floor(255 * norm);
            const b = 0;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x - this.x, y - this.y, 1, 1);
        }
    }
    createFragmentCanvas() {
        
        let ctx = this.offscreenCtx;
        for (let [region, pixels] of this.fragments) {
            ctx.fillStyle = `hsl(${region * 40 % 360}, 80%, 60%)`;
            for (let p of pixels) {
                ctx.fillRect(p.x - this.x, p.y - this.y, 1, 1);
            }
        }
    }

  


    drawNoise(ctx) { 

        const imageData = ctx.createImageData(this.width, this.height);
        let index = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.noise[y][x]; 
                const gray = Math.floor(value * 255/this.scale);

                imageData.data[index++] = gray; 
                imageData.data[index++] = gray;
                imageData.data[index++] = gray;
                imageData.data[index++] = 255;  
            }
        }

        ctx.putImageData(imageData, this.x, this.y);
    }

 

    drawPoints(ctx) {
        for (let point of this.voronoi_points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);

            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        }
    }
    drawVoronoi(ctx) {
        ctx.drawImage(this.offscreenCanvas, this.x, this.y);

    }

    drawFragments(ctx) {
        for (let frag of this.fragmentObjects) {
            frag.x += frag.vx * this.animationRate/5;
            frag.y += frag.vy* this.animationRate/5;
            frag.angle += frag.va* this.animationRate/5;

            ctx.save();
            ctx.translate(frag.x + this.width / 2, frag.y + this.height / 2);
            ctx.rotate(frag.angle);
            ctx.translate(-this.width / 2, -this.height / 2);
            ctx.drawImage(frag.canvas, 0, 0);
            ctx.restore();
        }
    }

    visualize(ctx)
    {

        if (this.displayDistanceField) {
            this.drawVoronoi(ctx);
        }
        else {
            if (this.fractured) {
                this.drawFragments(ctx);
            }
            else {
                ctx.putImageData(this.imageData, this.x, this.y);
            }
        }
        if (this.displayPoints) {
            this.drawPoints(ctx);
        }



        

        

    }
    
}
