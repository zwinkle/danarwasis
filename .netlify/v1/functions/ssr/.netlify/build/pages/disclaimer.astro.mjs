/* empty css                                  */
import { c as createComponent, a as renderComponent, r as renderTemplate, u as unescapeHTML } from '../chunks/astro/server_DwqtjhkU.mjs';
import 'kleur/colors';
import { $ as $$PlainMarkdown } from '../chunks/PlainMarkdown_Dc8JnyyJ.mjs';
export { renderers } from '../renderers.mjs';

const html = () => "<h1 id=\"disclaimer\">Disclaimer</h1>\n<h2 id=\"general-disclaimer\">General Disclaimer</h2>\n<ul>\n<li>Informasi yang disediakan di situs web ini hanya untuk tujuan informasi umum. Seluruh konten disajikan “apa adanya,” tanpa jaminan atau representasi apa pun, baik secara eksplisit maupun implisit. Kami tidak memberikan jaminan apa pun mengenai keakuratan, kelengkapan, atau keandalan informasi yang disediakan.</li>\n<li>Kami tidak bertanggung jawab atas kerugian atau kerusakan apa pun yang timbul akibat penggunaan atau ketergantungan pada informasi yang terdapat di situs web ini. <strong>Pengguna disarankan untuk memverifikasi informasi secara mandiri</strong> sebelum mengambil keputusan berdasarkan informasi tersebut.</li>\n<li>Situs web ini mungkin mengandung tautan ke situs web eksternal. Kami tidak mendukung atau bertanggung jawab atas konten, praktik, atau kebijakan situs web pihak ketiga mana pun. Pengguna mengakses tautan eksternal atas risiko mereka sendiri.</li>\n<li>Setiap konten situs dapat diubah, dihapus, atau dimodifikasi dengan cara lain tanpa pemberitahuan sebelumnya.</li>\n<li>Pendapat yang diungkapkan dalam posting blog mungkin telah berubah sejak tanggal publikasinya.</li>\n</ul>";

				const frontmatter = {"layout":"../layouts/PlainMarkdown.astro","title":"Disclaimer","heroImage":"../assets/images/disclaimer.jpg"};
				const file = "D:/code/PORTOFOLIO/danarwasis/src/pages/disclaimer.md";
				const url = "/disclaimer";
				function rawContent() {
					return "   \r\n                                        \r\n                   \r\n                                            \r\n   \r\n\r\n# Disclaimer\r\n\r\n## General Disclaimer\r\n\r\n- Informasi yang disediakan di situs web ini hanya untuk tujuan informasi umum. Seluruh konten disajikan “apa adanya,” tanpa jaminan atau representasi apa pun, baik secara eksplisit maupun implisit. Kami tidak memberikan jaminan apa pun mengenai keakuratan, kelengkapan, atau keandalan informasi yang disediakan.\r\n- Kami tidak bertanggung jawab atas kerugian atau kerusakan apa pun yang timbul akibat penggunaan atau ketergantungan pada informasi yang terdapat di situs web ini. **Pengguna disarankan untuk memverifikasi informasi secara mandiri** sebelum mengambil keputusan berdasarkan informasi tersebut.\r\n- Situs web ini mungkin mengandung tautan ke situs web eksternal. Kami tidak mendukung atau bertanggung jawab atas konten, praktik, atau kebijakan situs web pihak ketiga mana pun. Pengguna mengakses tautan eksternal atas risiko mereka sendiri.\r\n- Setiap konten situs dapat diubah, dihapus, atau dimodifikasi dengan cara lain tanpa pemberitahuan sebelumnya.\r\n- Pendapat yang diungkapkan dalam posting blog mungkin telah berubah sejak tanggal publikasinya.\r\n";
				}
				async function compiledContent() {
					return await html();
				}
				function getHeadings() {
					return [{"depth":1,"slug":"disclaimer","text":"Disclaimer"},{"depth":2,"slug":"general-disclaimer","text":"General Disclaimer"}];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${renderComponent(result, 'Layout', $$PlainMarkdown, {
								file,
								url,
								content,
								frontmatter: content,
								headings: getHeadings(),
								rawContent,
								compiledContent,
								'server:root': true,
							}, {
								'default': () => renderTemplate`${unescapeHTML(html())}`
							})}`;
				});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	Content,
	compiledContent,
	default: Content,
	file,
	frontmatter,
	getHeadings,
	rawContent,
	url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
