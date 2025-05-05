// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.

	// Create translation matrix using provided translation values
	var translationMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// Apply projection * translation
	var mvpMatrix = MatrixMult( projectionMatrix, translationMatrix );

	// Rotation around Y axis
	var rotationYMatrix = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	mvpMatrix = MatrixMult( mvpMatrix, rotationYMatrix );

	// Rotation around X axis
	var rotationXMatrix = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	mvpMatrix = MatrixMult( mvpMatrix, rotationXMatrix );

	return mvpMatrix;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		// Initialize shader program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Get locations of attributes and uniforms from shader
		this.attribPos = gl.getAttribLocation(this.prog, 'a_vertexPosition');
		this.attribTxc = gl.getAttribLocation(this.prog, 'a_texCoord');
		this.uniformMvp = gl.getUniformLocation(this.prog, 'u_modelViewProj');
		this.uniformShow = gl.getUniformLocation(this.prog, 'u_useTexture');
		this.uniformSwap = gl.getUniformLocation(this.prog, 'u_swapAxes');

		// State tracking variables
		this.checkbox_show = true;
		this.is_texture_exist = false;

		// Activate program and set initial values for uniforms
		gl.useProgram(this.prog);
		gl.uniform1i(this.uniformShow, false);
		gl.uniform1i(this.uniformSwap, false);

		// Create texture object and get sampler uniform location
		this.texture = gl.createTexture();
		this.uniformSampler = gl.getUniformLocation(this.prog, 'u_textureSampler');

		// Create buffers for vertex positions and texture coordinates
		this.bufferVertices = gl.createBuffer();
		this.bufferTexCoords = gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		// Store the number of vertices (each triangle has 3 vertices)
		this.numTriangles = vertPos.length / 3;

		gl.useProgram(this.prog);

		// Upload vertex positions to GPU
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// Upload texture coordinates to GPU
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoords);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader

		// Update the swap uniform to control axis transformation in vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.uniformSwap, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		// Use shader program and set the transformation matrix
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.uniformMvp, false, trans);

		// Set up vertex attribute for position
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
		gl.vertexAttribPointer(this.attribPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.attribPos);

		// Set up vertex attribute for texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoords);
		gl.vertexAttribPointer(this.attribTxc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.attribTxc);

		// Draw all triangles
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture

		// Set up and upload the image as texture
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		// Load texture data from image
		gl.generateMipmap(gl.TEXTURE_2D);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		// Set texture filtering and wrapping modes
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// Bind sampler to texture unit 0
		gl.uniform1i(this.uniformSampler, 0);

		// Mark texture as available and update shader state
		this.is_texture_exist = true;
		gl.uniform1i(this.uniformShow, this.checkbox_show && this.is_texture_exist);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.

		// Save checkbox state and update shader with combined condition
		this.checkbox_show = show;
		gl.useProgram(this.prog);
		gl.uniform1i(this.uniformShow, this.checkbox_show && this.is_texture_exist);
	}
	
}

var meshVS = `
	uniform bool u_swapAxes;
	uniform mat4 u_modelViewProj;
	attribute vec3 a_vertexPosition;
	attribute vec2 a_texCoord;
	varying vec2 v_texCoord;

	void main() {
		vec4 worldPos = vec4(a_vertexPosition, 1.0);

		if (!u_swapAxes)
			gl_Position = u_modelViewProj * worldPos;
		else {
			mat4 swapMatrix = mat4(
				1.0, 0.0,  0.0, 0.0,
				0.0, 0.0, -1.0, 0.0,
				0.0, 1.0,  0.0, 0.0,
				0.0, 0.0,  0.0, 1.0
			);
			gl_Position = u_modelViewProj * swapMatrix * worldPos;
		}

		v_texCoord = a_texCoord;
	}
`;


var meshFS = `
	precision mediump float;
	uniform bool u_useTexture;
	uniform sampler2D u_textureSampler;
	varying vec2 v_texCoord;

	void main() {
		if (u_useTexture)
			gl_FragColor = texture2D(u_textureSampler, v_texCoord);
		else
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
`;
