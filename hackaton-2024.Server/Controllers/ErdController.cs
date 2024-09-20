using System.Text;
using System.Text.Json;
using hackaton_2024.Server.Data.Entities;
using hackaton_2024.Server.Data.Models;
using hackaton_2024.Server.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace hackaton_2024.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ErdController : ControllerBase
    {
        private readonly IErdRepository _erdRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRepository _userRepository;

        public ErdController(IErdRepository erdRepository, IHttpContextAccessor httpContextAccessor, IUserRepository userRepository)
        {
            _erdRepository = erdRepository;
            _httpContextAccessor = httpContextAccessor;
            _userRepository = userRepository;
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> AddErd([FromBody] Erd erd)
        {
            return Ok(await _erdRepository.AddAsync(erd));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetAllErds()
        {
            var email = _httpContextAccessor.HttpContext.User.Identity.Name;
            var user = await _userRepository.GetUserWithEmail(email);

            var allErds = (await _erdRepository.GetAllAsync()).ToList();

            if (user.Role == "User")
            {
                allErds = allErds.Where(e => e.Email == user.Email).ToList();
            }

            return Ok(allErds.ToList());
        }

        [HttpPost("[action]")]
        public async Task<string> TriggerDbErdGeneration([FromBody] DbForm dbForm)
        {
            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, "https://eun-func-consumption-hackathon-03.azurewebsites.net/api/get_sql_metadata");

            if (dbForm.TableNames.Count == 1 && dbForm.TableNames[0]?.Length == 0)
            {
                dbForm.TableNames = new List<string>();
            }

            var jsonBody = JsonSerializer.Serialize(dbForm);
            Console.WriteLine(jsonBody);
            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
            request.Content = content;

            try
            {
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            catch (TimeoutException ex)
            {
                // Intentionally left empty to ignore timeout exceptions
            }

            return "";


            // var client = new HttpClient();
            // var request = new HttpRequestMessage(HttpMethod.Post, "https://eun-func-consumption-hackathon-03.azurewebsites.net/api/get_sql_metadata");
            // var content = new StringContent("{\r\n    \"ServerConnectionString\":\"hacakthonsrv.database.windows.net\",\r\n    \"ServerPort\":\"1433\",\r\n    \"DBName\":\"hackathon-db-we\",\r\n    \"Login\":\"hackathon_user\",\r\n    \"Password\":\"@MT6]x7tb;!YpUXB7rB;\",\r\n    \"TableNames\":[]\r\n}", null, "text/plain");
            // request.Content = content;
            // var response = await client.SendAsync(request);
            // return await response.Content.ReadAsStringAsync();




            // if (dbForm.TableNames.Count == 1 && dbForm.TableNames[0]?.Length == 0)
            // {
            //     dbForm.TableNames = [];
            // }
            //
            // var functionUrl = "https://eun-func-consumption-hackathon-03.azurewebsites.net/api/get_sql_metadata";
            // var jsonBody = JsonSerializer.Serialize(dbForm);
            // var content = new StringContent(jsonBody, Encoding.UTF8);
            //
            // try
            // {
            //     using (HttpClient client = new HttpClient())
            //     {
            //         var response = await client.PostAsync(functionUrl, content);
            //
            //         response.EnsureSuccessStatusCode();
            //
            //         var responseBody = await response.Content.ReadAsStringAsync();
            //
            //         return responseBody;
            //     }
            // }
            // catch (TimeoutException ex)
            // {
            //     //Intentionally left empty to ignore timeout exceptions
            // }
            //
            // return "Success";
        }

        [HttpPost("[action]")]
        public async Task<string> TriggerSaErdGeneration([FromBody] SaForm dbForm)
        {
            throw new NotImplementedException();
        }

        [HttpPost("[action]")]
        public async Task<string> TriggerGetTableDescription([FromBody] TableInfo tableName)
        {
            string tempResult = "**Table Description**\n\n**PII:**\n- The `Webpages-Classification-Large` and `Webpages-Classification` tables contain personally identifiable information (PII) such as `url`, `ip_add`, and `geo_loc`. These columns can potentially identify individuals or their locations.\n- The `Historical-Active-Sales` table does not contain any PII.\n\n**Data Granularity:**\n- `Historical-Active-Sales`: This table appears to have a fine granularity, capturing detailed sales data at the level of individual orders, SKUs, and marketing types.\n- `Webpages-Classification-Large` and `Webpages-Classification`: These tables also have fine granularity, capturing detailed information about individual web pages, including their URLs, IP addresses, and content characteristics.\n\n**Performance Considerations:**\n- **Historical-Active-Sales**:\n  - Potential bottlenecks could arise from the large volume of sales data, especially if the table is queried frequently for analytics or reporting.\n  - Optimization may be required for columns like `Order`, `SKU_number`, and `SoldCount` to ensure efficient indexing and querying.\n\n- **Webpages-Classification-Large**:\n  - This table could face performance issues due to the potentially large size of the `content` column, which may store extensive text data.\n  - The `url` and `ip_add` columns might also require indexing to speed up search and retrieval operations.\n  - Given the large dataset, partitioning or sharding strategies might be necessary to manage and query the data efficiently.\n\n- **Webpages-Classification**:\n  - Similar to the `Webpages-Classification-Large` table, performance bottlenecks could occur due to the size of the `content` column and the need for efficient indexing on `url` and `ip_add`.\n  - Optimization strategies similar to those for `Webpages-Classification-Large` should be considered to ensure efficient data handling.";

            return tempResult;

            var functionUrl = "https://eun-func-consumption-hackathon-03.azurewebsites.net/api/get_sql_metadata";
            var jsonBody = JsonSerializer.Serialize(tableName);
            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var response = await client.PostAsync(functionUrl, content);

                    response.EnsureSuccessStatusCode();

                    var responseBody = await response.Content.ReadAsStringAsync();

                    return responseBody;
                }
            }
            catch (TimeoutException ex)
            {
                //Intentionally left empty to ignore timeout exceptions
            }

            return "Success";
        }
    }
}
