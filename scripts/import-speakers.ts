/** CSV import starting point. Run server-side only after setting SUPABASE_SERVICE_ROLE_KEY.
 * Map each source header in columnMap; resolve tags by name and insert into person_tags.
 */
export const columnMap = { nombre: 'Nombre', apellidos: 'Apellidos', cargo: 'Cargo', empresa_organizacion: 'Empresa', email: 'Email', linkedin_url: 'LinkedIn', especialidades: 'Especialidades' } as const;
export function splitTags(value = '') { return value.split(/[;,|]/).map(x => x.trim()).filter(Boolean); }
export function duplicateMessage(name:string,email?:string,linkedin?:string) { return `Revisar coincidencias para ${name}: nombre completo${email ? ', email' : ''}${linkedin ? ' y LinkedIn' : ''}. Nunca se fusiona automáticamente.`; }
