using System.Security.Claims;
using hackaton_2024.Server.Data.Entities;
using hackaton_2024.Server.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace hackaton_2024.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRepository _userRepository;


        public UserController(IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet("[action]")]
        public ActionResult GetUserDetails()
        {
            if (_httpContextAccessor.HttpContext == null || _httpContextAccessor.HttpContext.User.Identity == null)
                return BadRequest();

            var email = _httpContextAccessor.HttpContext.User.Identity.Name;
            var role = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            if (email == null || role == null)
                return BadRequest();

            return Ok(new User
            {
                UserId = 0,
                Email = email,
                Name = string.Empty,
                Role = role
            });
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetAllUsers()
        {
            var email = _httpContextAccessor.HttpContext.User.Identity.Name;
            var allUsers = (await _userRepository.GetAllAsync()).ToList();
            allUsers = allUsers.Where(u => u.Email != email).ToList();
            return Ok(allUsers);
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            return Ok(await _userRepository.AddAsync(user));
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> DeleteUser([FromBody] User user)
        {
            return user == null ? NotFound() : Ok(await _userRepository.RemoveAsync(user));
        }
    }
}
