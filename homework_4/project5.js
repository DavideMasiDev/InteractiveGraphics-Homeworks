// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.

	var translationMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	const rotationYMatrix = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];


	const rotationXMatrix = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	return MatrixMult(translationMatrix, MatrixMult(rotationYMatrix, rotationXMatrix));
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
		gl.useProgram(this.prog);

		// Uniforms
		this.u_mvpMatrix = gl.getUniformLocation(this.prog, 'u_mvpMatrix');
		this.u_mvMatrix = gl.getUniformLocation(this.prog, 'u_mvMatrix');
		this.u_normalMatrix = gl.getUniformLocation(this.prog, 'u_normalMatrix');
		this.u_swapAxes = gl.getUniformLocation(this.prog, 'u_swapAxes');
		gl.uniform1i(this.u_swapAxes, false);

		this.u_lightVec = gl.getUniformLocation(this.prog, 'u_lightVec');
		this.u_shininess = gl.getUniformLocation(this.prog, 'u_shininess');
		this.u_displayTexture = gl.getUniformLocation(this.prog, 'u_displayTexture');
		gl.uniform1i(this.u_displayTexture, false);

		this.u_texture = gl.getUniformLocation(this.prog, 'u_texture');

		// Attributes
		this.a_position = gl.getAttribLocation(this.prog, 'a_position');
		this.positionBuffer = gl.createBuffer();

		this.a_normal = gl.getAttribLocation(this.prog, 'a_normal');
		this.normalBuffer = gl.createBuffer();

		this.a_texCoord = gl.getAttribLocation(this.prog, 'a_texCoord');
		this.texCoordBuffer = gl.createBuffer();

		// Texture
		this.texture = gl.createTexture();

		// State tracking variables
		this.checkbox_show = true;
		this.is_texture_exist = false;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		gl.useProgram(this.prog);

		// Upload vertex positions to GPU
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// Upload normal vector to GPU
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		// Upload texture coordinates to GPU
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_swapAxes, swap);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		// Activate the shader program
		gl.useProgram(this.prog);

		// Pass the uniform matrices to the shader
		gl.uniformMatrix4fv(this.u_mvpMatrix, false, matrixMVP);
		gl.uniformMatrix4fv(this.u_mvMatrix, false, matrixMV);
		gl.uniformMatrix3fv(this.u_normalMatrix, false, matrixNormal);

		// Bind and enable vertex position attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_position);

		// Bind and enable vertex normal attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.a_normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_normal);

		// Bind and enable texture coordinate attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.vertexAttribPointer(this.a_texCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_texCoord);

		// Render the triangles
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// Automatically generate mipmaps for scaling
		gl.generateMipmap(gl.TEXTURE_2D);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.uniform1i( this.u_texture, 0 );

		// Mark that a texture has been loaded
		this.is_texture_exist = true;

		// Control texture visibility based on flags
		gl.uniform1i( this.u_displayTexture, this.checkbox_show && this.is_texture_exist );
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		this.checkbox_show = show;
		gl.uniform1i( this.u_displayTexture, this.checkbox_show && this.is_texture_exist );
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.u_lightVec, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.u_shininess, shininess);
	}
}

const meshVS = `
	uniform bool u_swapAxes;
	attribute vec3 a_position, a_normal;
	attribute vec2 a_texCoord;
	uniform mat4 u_mvpMatrix, u_mvMatrix;
	uniform mat3 u_normalMatrix;
	varying vec3 v_normal, v_position;
	varying vec2 v_texCoord;

	void main() {
		if (!u_swapAxes) {
			gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
			v_position = vec3(u_mvMatrix * vec4(a_position, 1.0));
			v_normal = normalize(u_normalMatrix * a_normal);
		} else {
			mat4 axisSwapMat = mat4(
				1.0, 0.0, 0.0, 0.0,
				0.0, 0.0, -1.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);
			mat3 normalSwapMat = mat3(
				1.0, 0.0, 0.0,
				0.0, 0.0, -1.0,
				0.0, 1.0, 0.0
			);
			gl_Position = u_mvpMatrix * axisSwapMat * vec4(a_position, 1.0);
			v_position = vec3(u_mvMatrix * axisSwapMat * vec4(a_position, 1.0));
			v_normal = normalize(u_normalMatrix * normalSwapMat * a_normal);
		}
		v_texCoord = a_texCoord;
	}
`;

const meshFS = `
	precision mediump float;
	uniform sampler2D u_texture;
	uniform bool u_displayTexture;
	uniform float u_shininess;
	uniform vec3 u_lightVec;
	varying vec3 v_normal, v_position;
	varying vec2 v_texCoord;

	void main() {
		vec3 lightDir = normalize(u_lightVec);
		float lightStrength = length(u_lightVec);
		vec3 norm = normalize(v_normal);
		vec3 viewDir = -normalize(v_position);
		vec3 halfVec = normalize(lightDir + viewDir);
		
		float diff = max(dot(lightDir, norm), 0.0);
		float spec = pow(max(dot(halfVec, norm), 0.0), u_shininess);
		
		vec4 baseColor = u_displayTexture ? texture2D(u_texture, v_texCoord) : vec4(1.0);
		gl_FragColor = lightStrength * (diff + spec) * baseColor;
	}
`;

