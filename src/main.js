import './style.css'
import { supabase } from './supabase.js'

let currentMode = 'cliente';
let currentClient = null;
let currentAdminSucursal = null;

const whatsappSucursales = {
    1: { nombre: 'Valles', tel: '+593999999991' },
    2: { nombre: 'Quitumbe', tel: '+593999999992' },
    3: { nombre: 'Recreo', tel: '+593999999993' },
    4: { nombre: 'Real Audiencia', tel: '+593999999994' }
};

// Cambio de modo
document.getElementById('btnModeCliente').addEventListener('click', () => switchMode('cliente'));
document.getElementById('btnModeAdmin').addEventListener('click', () => switchMode('admin'));

function switchMode(mode) {
    currentMode = mode;
    const btnCli = document.getElementById('btnModeCliente');
    const btnAdm = document.getElementById('btnModeAdmin');
    const viewCli = document.getElementById('viewClientes');
    const viewAdm = document.getElementById('viewAdmin');

    if (mode === 'cliente') {
        btnCli.className = "px-4 py-1.5 text-sm font-bold rounded-lg transition-all bg-red-600 text-white shadow";
        btnAdm.className = "px-4 py-1.5 text-sm font-bold rounded-lg transition-all text-red-200 hover:text-white";
        viewCli.classList.remove('hidden');
        viewAdm.classList.add('hidden');
    } else {
        btnAdm.className = "px-4 py-1.5 text-sm font-bold rounded-lg transition-all bg-red-600 text-white shadow";
        btnCli.className = "px-4 py-1.5 text-sm font-bold rounded-lg transition-all text-red-200 hover:text-white";
        viewAdm.classList.remove('hidden');
        viewCli.classList.add('hidden');
    }
}

// Tabs Auth Clientes
document.getElementById('tabLogin').addEventListener('click', () => switchAuthTab('login'));
document.getElementById('tabRegister').addEventListener('click', () => switchAuthTab('register'));

function switchAuthTab(tab) {
    const tLogin = document.getElementById('tabLogin');
    const tReg = document.getElementById('tabRegister');
    const fLogin = document.getElementById('formLoginCliente');
    const fReg = document.getElementById('formRegisterCliente');

    if (tab === 'login') {
        tLogin.className = "flex-1 pb-3 font-bold text-red-500 border-b-2 border-red-500";
        tReg.className = "flex-1 pb-3 font-bold text-slate-400";
        fLogin.classList.remove('hidden');
        fReg.classList.add('hidden');
    } else {
        tReg.className = "flex-1 pb-3 font-bold text-red-500 border-b-2 border-red-500";
        tLogin.className = "flex-1 pb-3 font-bold text-slate-400";
        fReg.classList.remove('hidden');
        fLogin.classList.add('hidden');
    }
}

// Login Cliente
document.getElementById('formLoginCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = document.getElementById('loginUser').value.trim();
    const passInput = document.getElementById('loginPass').value.trim();
    const sucursalId = document.getElementById('globalSucursal').value;

    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('sucursal_id', sucursalId)
        .or(`nombre.eq.${userInput},cedula_ruc.eq.${userInput}`)
        .single();

    if (error || !data || data.password_hash !== passInput) {
        alert('Credenciales incorrectas o usuario no encontrado.');
        return;
    }

    currentClient = data;
    document.getElementById('authContainerCliente').classList.add('hidden');
    document.getElementById('dashboardCliente').classList.remove('hidden');
    renderClientDashboard();
});

// Registro Cliente
document.getElementById('formRegisterCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const cedula = document.getElementById('regCedula').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const cumple = document.getElementById('regCumple').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const sucursalId = document.getElementById('globalSucursal').value;

    const { error } = await supabase
        .from('clientes')
        .insert([{ sucursal_id: sucursalId, nombre, cedula_ruc: cedula, telefono, fecha_cumpleanos: cumple, password_hash: password }]);

    if (error) {
        alert('Error al registrar: ' + error.message);
        return;
    }

    alert('¡Registro exitoso! Ya puedes iniciar sesión.');
    switchAuthTab('login');
});

document.getElementById('btnLogoutCliente').addEventListener('click', () => {
    currentClient = null;
    document.getElementById('dashboardCliente').classList.add('hidden');
    document.getElementById('authContainerCliente').classList.remove('hidden');
});

async function renderClientDashboard() {
    if (!currentClient) return;
    document.getElementById('welcomeUserTitle').innerText = `¡Hola, ${currentClient.nombre}!`;
    document.getElementById('lblPremiosObtenidos').innerText = currentClient.premios_obtenidos;
    document.getElementById('lblSellosCount').innerText = `${currentClient.sellos_actuales} / 6 Sellos`;

    const grid = document.getElementById('sellosGridContainer');
    grid.innerHTML = '';
    for (let i = 1; i <= 6; i++) {
        const activo = i <= currentClient.sellos_actuales;
        grid.innerHTML += `
            <div class="h-24 rounded-2xl border ${activo ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50' : 'bg-[#080c14] border-slate-800 opacity-40'} flex flex-col items-center justify-center p-2 relative transition-all">
                <span class="absolute top-1.5 left-2 text-[10px] font-black ${activo ? 'text-red-400' : 'text-slate-600'}">${i}</span>
                <img src="/logo.png" alt="Sello Stop Deli" class="h-10 sm:h-12 w-auto object-contain my-auto ${activo ? 'filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-105' : 'grayscale brightness-50'} transition-all">
            </div>
        `;
    }

    const waContainer = document.getElementById('whatsappLinksContainer');
    waContainer.innerHTML = '';
    Object.keys(whatsappSucursales).forEach(id => {
        const suc = whatsappSucursales[id];
        waContainer.innerHTML += `
            <a href="https://wa.me/${suc.tel.replace('+', '')}" target="_blank" class="bg-slate-950 border border-slate-800 hover:border-green-500 p-3 rounded-xl flex items-center gap-3 transition-all">
                <i class="fa-brands fa-whatsapp text-green-500 text-2xl"></i>
                <div><span class="text-xs text-slate-400 block">Sucursal</span><span class="font-bold text-white text-sm">${suc.nombre}</span></div>
            </a>
        `;
    });

    document.getElementById('perfilNombre').innerText = currentClient.nombre;
    document.getElementById('perfilCedula').innerText = currentClient.cedula_ruc;
    document.getElementById('perfilTelefono').innerText = currentClient.telefono;
    document.getElementById('perfilCumple').innerText = currentClient.fecha_cumpleanos;

    const { data: premioData } = await supabase
        .from('premios')
        .select('*')
        .eq('sucursal_id', currentClient.sucursal_id)
        .eq('activo', true)
        .single();

    if (premioData) {
        document.getElementById('premioTituloActivo').innerText = premioData.titulo;
        document.getElementById('premioDescActiva').innerText = premioData.descripcion;
    }
}

// Navegación Cliente Tabs
['inicio', 'menu', 'promos', 'perfil'].forEach(tab => {
    document.getElementById(`clientTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).addEventListener('click', () => {
        ['inicio', 'menu', 'promos', 'perfil'].forEach(t => {
            document.getElementById(`clientView${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.add('hidden');
            const btn = document.getElementById(`clientTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
            btn.className = "flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-800/50";
        });
        document.getElementById(`clientView${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
        const activeBtn = document.getElementById(`clientTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        activeBtn.className = "flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-300 text-red-500 bg-red-950/40 border border-red-900/40 shadow-inner";
    });
});

// Enviar sugerencia
document.getElementById('formSugerencia').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('sugTipo').value;
    const mensaje = document.getElementById('sugMensaje').value.trim();

    const { error } = await supabase.from('sugerencias_reclamos').insert([{
        cliente_id: currentClient.id,
        sucursal_id: currentClient.sucursal_id,
        tipo,
        mensaje
    }]);

    if (error) { alert('Error: ' + error.message); return; }
    alert('¡Comentario enviado con éxito!');
    document.getElementById('sugMensaje').value = '';
});

// Login Admin
document.getElementById('formLoginAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('adminPassInput').value.trim();
    const sucursalId = document.getElementById('globalSucursal').value;

    const { data, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('sucursal_id', sucursalId)
        .eq('password_hash', pass)
        .single();

    if (error || !data) {
        alert('Contraseña incorrecta para esta sucursal.');
        return;
    }

    currentAdminSucursal = sucursalId;
    document.getElementById('authContainerAdmin').classList.add('hidden');
    document.getElementById('dashboardAdmin').classList.remove('hidden');
    cargarDashboardAdmin();
});

document.getElementById('btnLogoutAdmin').addEventListener('click', () => {
    currentAdminSucursal = null;
    document.getElementById('dashboardAdmin').classList.add('hidden');
    document.getElementById('authContainerAdmin').classList.remove('hidden');
});

// Admin Tabs
['reportes', 'clientes', 'consumo', 'premios'].forEach(tab => {
    document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).addEventListener('click', () => {
        ['reportes', 'clientes', 'consumo', 'premios'].forEach(t => {
            document.getElementById(`adminView${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.add('hidden');
            document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`).className = "px-4 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 rounded-lg font-bold text-sm";
        });
        document.getElementById(`adminView${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
        document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).className = "px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow";

        if (tab === 'clientes') cargarClientesAdmin();
        if (tab === 'reportes') cargarDashboardAdmin();
    });
});

async function cargarDashboardAdmin() {
    if (!currentAdminSucursal) return;
    const { data } = await supabase.rpc('obtener_estadisticas_sucursal', { p_sucursal_id: parseInt(currentAdminSucursal) });
    if (data) {
        document.getElementById('repTotalClientes').innerText = data.total_clientes;
        document.getElementById('repSellosActivos').innerText = data.sellos_activos;
        document.getElementById('repConsumoTotal').innerText = `$${parseFloat(data.consumo_total).toFixed(2)}`;
        document.getElementById('repPremiosEntregados').innerText = data.premios_entregados;
    }
}

async function cargarClientesAdmin() {
    const { data } = await supabase.from('clientes').select('*').eq('sucursal_id', currentAdminSucursal);
    const tbody = document.getElementById('tablaClientesAdminBody');
    tbody.innerHTML = '';
    (data || []).forEach(c => {
        tbody.innerHTML += `
            <tr class="border-b border-slate-800">
                <td class="p-3 font-bold text-white">${c.nombre}</td>
                <td class="p-3 text-slate-300">${c.cedula_ruc}</td>
                <td class="p-3 text-slate-300">${c.telefono}</td>
                <td class="p-3 text-red-400 font-bold">${c.sellos_actuales} / 6</td>
                <td class="p-3 text-amber-400 font-bold">${c.premios_obtenidos}</td>
                <td class="p-3 text-right">
                    <button onclick="window.eliminarCliente('${c.id}')" class="text-red-500 hover:text-red-400 font-bold text-xs bg-red-950 px-2.5 py-1 rounded border border-red-900">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

window.eliminarCliente = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    cargarClientesAdmin();
};

document.getElementById('formConsumoCaja').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cedula = document.getElementById('cajaCedula').value.trim();
    const monto = parseFloat(document.getElementById('cajaMonto').value);

    const { data, error } = await supabase.rpc('registrar_consumo_cliente', {
        p_cedula_ruc: cedula,
        p_sucursal_id: parseInt(currentAdminSucursal),
        p_monto: monto
    });

    if (error || !data.success) {
        alert('Error: ' + (error?.message || data.message));
        return;
    }

    let msg = `¡Consumo registrado!\nSellos actuales: ${data.sellos_actuales} / 6`;
    if (data.premio_ganado) msg += `\n\n🎉 ¡El cliente completó los 6 sellos y ganó un premio!`;
    alert(msg);
    document.getElementById('cajaCedula').value = '';
    document.getElementById('cajaMonto').value = '';
    cargarDashboardAdmin();
});

document.getElementById('formPremioAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('premioTituloInput').value.trim();
    const descripcion = document.getElementById('premioDescInput').value.trim();

    await supabase.from('premios').update({ activo: false }).eq('sucursal_id', currentAdminSucursal);
    const { error } = await supabase.from('premios').insert([{
        sucursal_id: parseInt(currentAdminSucursal),
        titulo,
        descripcion,
        activo: true
    }]);

    if (error) { alert('Error: ' + error.message); return; }
    alert('¡Premio actualizado con éxito!');
});

// LÓGICA DEL MENÚ INTERACTIVO TIPO LIBRO (5 PÁGINAS)
let paginaActualMenu = 1;
const totalPaginasMenu = 5;

window.cambiarPaginaMenu = function(direccion) {
    paginaActualMenu += direccion;
    if (paginaActualMenu > totalPaginasMenu) paginaActualMenu = 1;
    if (paginaActualMenu < 1) paginaActualMenu = totalPaginasMenu;
    actualizarVistaMenu();
};

window.irAPaginaMenu = function(numPagina) {
    paginaActualMenu = numPagina;
    actualizarVistaMenu();
};

function actualizarVistaMenu() {
    const imgElem = document.getElementById('menuPageImg');
    const numElem = document.getElementById('currentPageNum');
    
    if (!imgElem || !numElem) return;

    // Efecto de transición suave de hoja
    imgElem.style.opacity = '0';
    imgElem.style.transform = 'scale(0.95)';

    setTimeout(() => {
        imgElem.src = `/menu/page_${paginaActualMenu}.png`;
        numElem.innerText = paginaActualMenu;
        imgElem.style.opacity = '1';
        imgElem.style.transform = 'scale(1)';
    }, 150);

    // Actualizar los 5 puntos indicadores
    for (let i = 1; i <= totalPaginasMenu; i++) {
        const dot = document.getElementById(`dotMenu${i}`);
        if (dot) {
            dot.className = i === paginaActualMenu 
                ? "w-3 h-3 rounded-full bg-red-600 transition-all shadow-md shadow-red-900" 
                : "w-3 h-3 rounded-full bg-slate-800 transition-all";
        }
    }
}