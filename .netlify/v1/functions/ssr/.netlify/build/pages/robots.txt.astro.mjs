export { renderers } from '../renderers.mjs';

const robotsTxt = `
User-agent: *
Allow: /


Sitemap: ${new URL("sitemap-index.xml", "https://danarwasis.my.id").href}

#                                         |
#                                         |
#                                         |
#                                         |
#   _______                   ________    |
#  |ooooooo|      ____       | __  __ |   |
#  |[]+++[]|     [____]      |/  /  |   |
#  |+ ___ +|     ]()()[      |__/__/|   |
#  |:|   |:|   _____/___    |[][][][]|   |
#  |:|___|:|  |__|    |__|   |++++++++|   |
#  |[]===[]|   |_|_/_|_|    | ______ |   |
#_ ||||||||| _ | | __ | | __ ||______|| __|
#  |_______|   |_|[::]|_|    |________|   #              _|_||_|_/                  #                |_||_|                     #               _|_||_|_                     #      ____    |___||___|                     #     /  __          ____                     #     ( oo          (___                      #     __o/           oo~)/  __________________
#    / |/          _-_/_                  |
#   / / __ ___    / |/    | It's a robot  |
#    |   |__/_)  / / .-   |_______________|
#    /_)  |         .  /_/ 
#     ||___|        /___(_/  
#     | | |          | |  |
#     | | |          | |  |
#     |_|_|          |_|__|
#     [__)_)        (_(___]
`.trim();
const GET = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
