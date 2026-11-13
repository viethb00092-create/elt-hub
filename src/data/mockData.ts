import { Discussion, Resource, TheoryModule, ToolItem } from "../types";

export const initialResources: Resource[] = [
  {
    id: "1",
    title: "15 hoạt động khởi động lớp học",
    description: "Bộ hoạt động ngắn giúp lớp học tràn đầy năng lượng ngay từ những phút đầu.",
    category: "Kinh nghiệm",
    level: "Mọi cấp độ",
    author: "Nguyễn Minh Anh",
    initials: "MA",
    color: "avatar-mint",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "1.2k",
    publishedAt: "12/11/2026",
    sections: [
      {
        heading: "1. Vì sao 5 phút đầu giờ quyết định nhịp độ cả tiết học?",
        body: "Học sinh thường bước vào lớp tiếng Anh với tâm lý e dè hoặc mệt mỏi sau các môn học trước. Một hoạt động Warm-up từ 3–5 phút không cần chuẩn bị cầu kỳ sẽ giúp phá băng không khí, kích hoạt vốn từ vựng sẵn có và chuyển trạng thái não bộ sang phản xạ tiếng Anh tự nhiên.",
        image:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Hoạt động khởi động theo nhóm nhỏ giúp học sinh tự tin giao tiếp ngay từ đầu giờ.",
      },
      {
        heading: "2. Top 3 trò chơi không cần máy chiếu (Zero-Prep Warm-ups)",
        body: "• Two Truths and a Lie: Giáo viên viết 3 câu về bản thân lên bảng (2 thật, 1 giả), cả lớp đặt câu hỏi Yes/No để tìm ra câu giả.\n• Word Association Chain: Học sinh nối từ theo chủ đề trong 60 giây, đội nào lặp từ sẽ thực hiện một thử thách vui.\n• Back to the Board: Một bạn quay lưng lại bảng, cả lớp diễn tả từ khóa bằng tiếng Anh mà không nhắc tới từ gốc.",
        image:
          "https://images.unsplash.com/photo-1758270704226-db897b180243?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Chỉ cần phấn trắng và bảng đen là thầy cô đã có thể tổ chức trò chơi tương tác.",
      },
    ],
  },
  {
    id: "2",
    title: "Food & Drinks — Vocabulary Game",
    description: "Trò chơi tương tác luyện từ vựng theo chủ đề, sẵn sàng dùng ngay trên lớp.",
    category: "Công cụ",
    level: "Kids",
    author: "Trần Thu Hà",
    initials: "TH",
    color: "avatar-gold",
    image:
      "https://images.unsplash.com/photo-1527822618093-743f3e57977c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "980",
    publishedAt: "10/11/2026",
    sections: [
      {
        heading: "1. Mục tiêu bài học & Bộ từ vựng trọng tâm",
        body: "Bộ trò chơi thiết kế cho học sinh tiểu học (6–10 tuổi) nhằm ghi nhớ 16 danh từ chủ đề Đồ ăn & Thức uống (sandwich, noodles, lemonade, watermelon, yogurt...) kết hợp mẫu câu giao tiếp cơ bản: 'What would you like to eat/drink?' và 'I'd like some..., please.'",
        image:
          "https://images.unsplash.com/photo-1527822618093-743f3e57977c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Hình ảnh trực quan sinh động giúp học sinh Kids ghi nhớ mặt chữ và phát âm nhanh hơn.",
      },
      {
        heading: "2. Cách tổ chức hoạt động 'Mini Restaurant' trên lớp",
        body: "Chia lớp thành 4 nhóm đóng vai đầu bếp và thực khách. Mỗi nhóm nhận một thực đơn minh họa, học sinh luân phiên đặt món và ghi lại đơn hàng của bạn cùng bàn. Cuối giờ, nhóm hoàn thành chính xác nhiều đơn hàng nhất sẽ nhận sao thưởng.",
        image:
          "https://images.unsplash.com/photo-1574130303188-31a915382726?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Thực hành đóng vai theo cặp giúp tăng thời gian nói (STT) của từng học sinh.",
      },
    ],
  },
  {
    id: "3",
    title: "Lesson Plan: My Future Career",
    description: "Giáo án 45 phút hoàn chỉnh, tập trung kỹ năng nói và tư duy phản biện.",
    category: "Tài liệu",
    level: "Teens",
    author: "Lê Hoàng Nam",
    initials: "HN",
    color: "avatar-blue",
    image:
      "https://images.unsplash.com/photo-1758270704262-ecc82b23dc37?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "846",
    publishedAt: "08/11/2026",
    sections: [
      {
        heading: "1. Cấu trúc giáo án 45 phút (Khung PPP mở rộng)",
        body: "• Lead-in (7 phút): Đoán nghề nghiệp qua 3 gợi ý về kỹ năng và môi trường làm việc.\n• Presentation (12 phút): Cung cấp cụm từ mô tả tính cách & nghề nghiệp (problem-solving, creative mindset, software engineer, content creator).\n• Practice (12 phút): Ghép cặp phỏng vấn định hướng nghề nghiệp theo phiếu khảo sát.",
        image:
          "https://images.unsplash.com/photo-1758270704262-ecc82b23dc37?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Học sinh cấp THCS/THPT hào hứng thảo luận về các ngành nghề hiện đại.",
      },
      {
        heading: "2. Hoạt động Production: Thuyết trình 'My Dream Job in 2035'",
        body: "Học sinh làm việc theo nhóm 3 người, thiết kế một tấm thẻ giới thiệu công việc mơ ước trong tương lai gồm: tên nghề, kỹ năng cần có và giá trị mang lại cho cộng đồng. Mỗi nhóm trình bày trong 2 phút và nhận phản hồi từ các bạn trong lớp.",
        image:
          "https://images.unsplash.com/photo-1758270703928-6a8597669abc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Kết hợp kỹ năng thuyết trình và phản biện giúp tiết học sôi nổi đến phút cuối.",
      },
    ],
  },
  {
    id: "4",
    title: "Classroom Management Toolkit",
    description: "Các biểu mẫu và chiến lược thực tế giúp xây dựng lớp học tích cực, chủ động.",
    category: "Kinh nghiệm",
    level: "Mọi cấp độ",
    author: "Phạm Linh Chi",
    initials: "LC",
    color: "avatar-coral",
    image:
      "https://images.unsplash.com/photo-1758270703928-6a8597669abc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "734",
    publishedAt: "05/11/2026",
    sections: [
      {
        heading: "1. Bộ tín hiệu giữ trật tự không cần lớn tiếng (Attention Grabbers)",
        body: "Thay vì nhắc nhở nhiều lần gây mệt mỏi, thầy cô có thể thống nhất các khẩu lệnh phản hồi nhanh ngay từ buổi đầu tiên: Giáo viên hô 'Class, class!' — Học sinh đáp 'Yes, yes!'; hoặc vỗ tay theo nhịp 1-2-3 để cả lớp lập tức hướng mắt lên bảng.",
        image:
          "https://images.unsplash.com/photo-1758270703928-6a8597669abc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Thiết lập thói quen lớp học rõ ràng giúp tiết kiệm 10 phút ổn định trật tự mỗi tiết.",
      },
      {
        heading: "2. Bảng theo dõi thi đua nhóm tích cực",
        body: "Sử dụng hệ thống điểm thưởng dựa trên hành vi tích cực: hỗ trợ bạn cùng bàn, phát biểu bằng tiếng Anh trọn câu, hoàn thành bài tập đúng giờ. Cuối tuần, nhóm dẫn đầu được quyền chọn bài hát khởi động cho tuần kế tiếp.",
        image:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Khích lệ tinh thần đồng đội thay vì chỉ tập trung vào điểm số cá nhân.",
      },
    ],
  },
  {
    id: "5",
    title: "Printable: Daily Routines",
    description: "Worksheet minh họa sinh động, có đáp án và ba mức độ phân hóa.",
    category: "Tài liệu",
    level: "Kids",
    author: "Vũ Mai Phương",
    initials: "MP",
    color: "avatar-purple",
    image:
      "https://images.unsplash.com/photo-1574130303188-31a915382726?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "615",
    publishedAt: "03/11/2026",
    sections: [
      {
        heading: "1. Thiết kế phiếu bài tập phân hóa 3 cấp độ (Differentiated Worksheets)",
        body: "Trong cùng một lớp học, trình độ tiếp thu của học sinh luôn có sự chênh lệch. Bộ phiếu bài tập Daily Routines được chia làm 3 mức: Mức 1 (Nối tranh với từ vựng), Mức 2 (Điền từ vào chỗ trống theo khung giờ), và Mức 3 (Viết đoạn văn ngắn kể về một ngày cuối tuần).",
        image:
          "https://images.unsplash.com/photo-1574130303188-31a915382726?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Mọi học sinh đều hoàn thành được mục tiêu phù hợp với năng lực của mình.",
      },
      {
        heading: "2. Hướng dẫn sử dụng phiếu kết hợp hoạt động cặp đôi",
        body: "Sau khi hoàn thành phần điền thông tin cá nhân, học sinh quay sang hỏi bạn bên cạnh: 'What time do you get up?' và ghi lại câu trả lời vào cột 'My Friend' để luyện chia động từ ngôi thứ ba số ít.",
        image:
          "https://images.unsplash.com/photo-1527822618093-743f3e57977c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Biến bài tập ngữ pháp trên giấy thành hoạt động giao tiếp có ý nghĩa.",
      },
    ],
  },
  {
    id: "6",
    title: "Think–Pair–Share đúng cách",
    description: "Hướng dẫn từng bước để mọi học sinh đều tham gia và được lắng nghe.",
    category: "Lý thuyết",
    level: "Teens",
    author: "Đỗ Việt Đức",
    initials: "VĐ",
    color: "avatar-green",
    image:
      "https://images.unsplash.com/photo-1758270704226-db897b180243?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
    downloads: "592",
    publishedAt: "01/11/2026",
    sections: [
      {
        heading: "1. Lỗi thường gặp khiến Think–Pair–Share kém hiệu quả",
        body: "Nhiều giáo viên đặt câu hỏi xong liền yêu cầu học sinh quay sang nói chuyện ngay lập tức, bỏ qua bước 'Think' (suy nghĩ độc lập). Điều này khiến những học sinh hướng nội hoặc vốn từ còn hạn chế chưa kịp sắp xếp ý tưởng và dễ rơi vào im lặng.",
        image:
          "https://images.unsplash.com/photo-1758270704226-db897b180243?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Dành 45 giây im lặng để học sinh ghi chú ý tưởng trước khi thảo luận cặp đôi.",
      },
      {
        heading: "2. Quy trình 3 bước chuẩn trên lớp học",
        body: "• Bước 1 — Think (1 phút): Học sinh tự viết 2–3 từ khóa hoặc câu trả lời nháp vào vở.\n• Bước 2 — Pair (2 phút): Trao đổi với bạn cùng bàn, bổ sung ý tưởng cho nhau.\n• Bước 3 — Share (3 phút): Giáo viên mời đại diện trình bày lại ý kiến của bạn mình (giúp rèn kỹ năng lắng nghe chủ động).",
        image:
          "https://images.unsplash.com/photo-1758270704262-ecc82b23dc37?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
        caption: "Kỹ thuật đơn giản giúp tăng tỷ lệ học sinh tham gia phát biểu lên gấp 3 lần.",
      },
    ],
  },
];

export const resourceFilters = ["Tất cả", "Tài liệu", "Kinh nghiệm", "Công cụ", "Kids", "Teens"];

export const theoryFilters = [
  "Tất cả",
  "Khung giáo án",
  "Quản lý lớp học",
  "Lý thuyết giảng dạy",
  "Phương pháp",
  "Đánh giá",
];

export const initialTheoryModules: TheoryModule[] = [
  {
    id: "phuong-phap-ppp",
    title: "Phương pháp PPP",
    label: "Phương pháp",
    text: "Tổ chức bài học theo ba giai đoạn Presentation, Practice và Production.",
    author: "Nguyễn Minh Anh",
    initials: "MA",
    color: "avatar-mint",
    publishedAt: "11/11/2026",
    image: initialResources[0].image,
    sections: [
      {
        heading: "1. Bản chất của mô hình Presentation – Practice – Production",
        body: "PPP là khung thiết kế bài giảng kinh điển giúp chuyển dịch dần quyền chủ động từ giáo viên sang học sinh. Ở giai đoạn Presentation, giáo viên giới thiệu ngữ liệu mới trong ngữ cảnh rõ ràng; sang Practice, học sinh luyện tập có kiểm soát để đạt độ chính xác (accuracy); và tại Production, học sinh tự do vận dụng ngôn ngữ để giao tiếp thực tế (fluency).",
        image: initialResources[0].image,
        caption: "Sơ đồ chuyển dịch vai trò từ giáo viên hướng dẫn sang học sinh làm chủ ngôn ngữ.",
      },
      {
        heading: "2. Ví dụ triển khai một tiết dạy Ngữ pháp 45 phút",
        body: "• Presentation (10 phút): Dùng câu chuyện ngắn hoặc tranh minh họa để học sinh tự rút ra cấu trúc thì Quá khứ đơn.\n• Practice (15 phút): Làm bài tập chia động từ và luyện hỏi đáp theo cặp với mẫu câu gợi ý sẵn.\n• Production (20 phút): Kể lại một chuyến đi đáng nhớ của bản thân trong nhóm 4 người mà không nhìn tài liệu.",
        image: initialResources[2].image,
        caption: "Cân đối thời lượng hợp lý để giai đoạn Production không bị cắt xén cuối giờ.",
      },
    ],
  },
  {
    id: "tblt",
    title: "Task-Based Language Teaching",
    label: "Lý thuyết giảng dạy",
    text: "Giúp người học sử dụng ngôn ngữ để hoàn thành nhiệm vụ có ý nghĩa.",
    author: "Lê Hoàng Nam",
    initials: "HN",
    color: "avatar-blue",
    publishedAt: "09/11/2026",
    image: initialResources[2].image,
    sections: [
      {
        heading: "1. Học ngôn ngữ thông qua giải quyết nhiệm vụ thực tế",
        body: "Khác với cách dạy truyền thống đi từ cấu trúc ngữ pháp trước, TBLT đặt một nhiệm vụ thực tế làm trung tâm (ví dụ: lên kế hoạch một chuyến dã ngoại cuối tuần với ngân sách 500.000đ). Học sinh buộc phải dùng tiếng Anh như một công cụ để thương lượng, thống nhất và hoàn thành sản phẩm.",
        image: initialResources[2].image,
        caption: "Ngôn ngữ được hình thành tự nhiên khi học sinh tập trung vào mục tiêu giao tiếp.",
      },
      {
        heading: "2. Chu trình 3 bước: Pre-task → Task Cycle → Language Focus",
        body: "• Pre-task: Giáo viên giới thiệu chủ đề, làm rõ yêu cầu nhiệm vụ và gợi mở từ vựng cần thiết.\n• Task Cycle: Học sinh thực hiện nhiệm vụ theo nhóm, chuẩn bị báo cáo và trình bày kết quả trước lớp.\n• Language Focus: Giáo viên phân tích các lỗi ngôn ngữ phổ biến ghi nhận được trong quá trình học sinh thảo luận.",
        image: initialResources[3].image,
        caption: "Phần chữa lỗi ngữ pháp được đặt sau khi học sinh đã hoàn thành nhiệm vụ giao tiếp.",
      },
    ],
  },
  {
    id: "quan-ly-lop-hoc",
    title: "Quản lý lớp học tích cực",
    label: "Quản lý lớp học",
    text: "Xây dựng quy tắc, thói quen và môi trường khuyến khích học sinh tham gia.",
    author: "Phạm Linh Chi",
    initials: "LC",
    color: "avatar-coral",
    publishedAt: "07/11/2026",
    image: initialResources[3].image,
    sections: [
      {
        heading: "1. Thiết lập nội quy lớp học cùng học sinh",
        body: "Thay vì áp đặt danh sách điều cấm đoán, thầy cô hãy dành 10 phút đầu năm học để cùng học sinh thống nhất 4–5 nguyên tắc tích cực (ví dụ: 'Lắng nghe khi bạn nói', 'Mạnh dạn thử và không sợ sai'). Khi được tham gia xây dựng quy tắc, học sinh sẽ có ý thức tự giác tuân thủ cao hơn.",
        image: initialResources[3].image,
        caption: "Môi trường lớp học an toàn về tâm lý giúp học sinh bớt sợ mắc lỗi phát âm.",
      },
      {
        heading: "2. Kỹ thuật chuyển tiếp hoạt động mượt mà (Smooth Transitions)",
        body: "Phần lớn sự xao nhãng xảy ra ở khoảng thời gian chuyển từ hoạt động này sang hoạt động khác. Hãy luôn đưa ra hướng dẫn ngắn gọn, kiểm tra lại bằng câu hỏi ICQs (Instruction Checking Questions) trước khi phát phiếu bài tập cho học sinh.",
        image: initialResources[0].image,
        caption: "Đưa hướng dẫn trước khi phát tài liệu giúp học sinh tập trung lắng nghe 100%.",
      },
    ],
  },
  {
    id: "thiet-ke-giao-an",
    title: "Thiết kế giáo án hiệu quả",
    label: "Khung giáo án",
    text: "Từ mục tiêu đầu ra đến chuỗi hoạt động phù hợp với nhịp độ lớp học.",
    author: "Đỗ Việt Đức",
    initials: "VĐ",
    color: "avatar-green",
    publishedAt: "04/11/2026",
    image: initialResources[5].image,
    sections: [
      {
        heading: "1. Tư duy thiết kế ngược (Backward Design)",
        body: "Khi soạn giáo án, thay vì bắt đầu bằng câu hỏi 'Hôm nay mình sẽ dạy bài tập nào trong sách?', hãy bắt đầu bằng 'Kết thúc 45 phút, học sinh sẽ tự làm được gì bằng tiếng Anh?'. Mọi hoạt động trong tiết học đều phải phục vụ trực tiếp cho mục tiêu đầu ra đó.",
        image: initialResources[5].image,
        caption: "Xác định rõ mục tiêu đầu ra (Learning Outcomes) trước khi chọn hoạt động.",
      },
      {
        heading: "2. Nguyên tắc cân bằng tương tác (Interaction Patterns)",
        body: "Một giáo án hấp dẫn cần luân phiên đa dạng hình thức tương tác: Giáo viên – Cả lớp (T-Ss), Cá nhân (S), Cặp đôi (S-S) và Nhóm nhỏ (Ss-Ss). Tránh để giáo viên nói liên tục quá 10 phút mà không có hoạt động phản hồi từ người học.",
        image: initialResources[2].image,
        caption: "Đa dạng hóa hình thức tương tác giúp duy trì sự tập trung xuyên suốt tiết học.",
      },
    ],
  },
  {
    id: "danh-gia-tien-bo",
    title: "Đánh giá vì sự tiến bộ",
    label: "Đánh giá",
    text: "Các kỹ thuật kiểm tra nhanh và phản hồi giúp học sinh tiến bộ mỗi ngày.",
    author: "Trần Thu Hà",
    initials: "TH",
    color: "avatar-gold",
    publishedAt: "02/11/2026",
    image: initialResources[1].image,
    sections: [
      {
        heading: "1. Đánh giá thường xuyên (Formative Assessment) ngay trong giờ học",
        body: "Thầy cô không cần đợi đến bài kiểm tra 15 phút hay giữa kỳ mới biết học sinh hiểu bài đến đâu. Các kỹ thuật như giơ thẻ màu (Đỏ - Vàng - Xanh), bảng con mini hoặc phiếu Exit Ticket 2 phút cuối giờ giúp nắm bắt ngay mức độ tiếp thu của từng em.",
        image: initialResources[1].image,
        caption: "Phản hồi kịp thời ngay trong tiết học giúp điều chỉnh tốc độ giảng dạy phù hợp.",
      },
      {
        heading: "2. Nghệ thuật phản hồi khích lệ (Constructive Feedback)",
        body: "Áp dụng công thức '2 ngôi sao và 1 điều ước' (Two Stars and a Wish): Chỉ ra 2 điểm học sinh đã làm tốt trong bài nói/viết và 1 gợi ý cụ thể để các em cải thiện ở lần tiếp theo.",
        image: initialResources[4].image,
        caption: "Phản hồi cụ thể giúp học sinh biết chính xác mình cần sửa gì để tiến bộ.",
      },
    ],
  },
  {
    id: "think-pair-share-ly-thuyet",
    title: "Think–Pair–Share",
    label: "Phương pháp",
    text: "Một cấu trúc đơn giản để mọi học sinh có thời gian suy nghĩ và lên tiếng.",
    author: "Vũ Mai Phương",
    initials: "MP",
    color: "avatar-purple",
    publishedAt: "30/10/2026",
    image: initialResources[4].image,
    sections: [
      {
        heading: "1. Cơ sở sư phạm của kỹ thuật hợp tác Think–Pair–Share",
        body: "Được phát triển bởi Frank Lyman, kỹ thuật này giải quyết triệt để tình trạng chỉ có 3–4 học sinh khá giỏi giơ tay phát biểu trong khi cả lớp thụ động ngồi nghe. Thời gian chờ (Wait Time) giúp giảm áp lực tâm lý và nâng cao chất lượng câu trả lời.",
        image: initialResources[4].image,
        caption: "Mọi học sinh đều có cơ hội luyện nói trong môi trường cặp đôi ít áp lực.",
      },
      {
        heading: "2. Biến thể nâng cao cho lớp học đông học sinh",
        body: "Thầy cô có thể kết hợp thành 'Think–Pair–Square': sau khi thảo luận theo cặp (2 người), hai cặp quay lại ghép thành nhóm 4 người để tổng hợp ý kiến chung trước khi đại diện nhóm chia sẻ trước toàn lớp.",
        image: initialResources[5].image,
        caption: "Mở rộng từ cặp đôi sang nhóm 4 người giúp tăng chiều sâu thảo luận.",
      },
    ],
  },
];

export const forumCategories = [
  "Tất cả thảo luận",
  "Phương pháp",
  "Tài liệu",
  "Hoạt động lớp",
  "Hỏi đáp",
];

export const memberProfiles: Record<
  string,
  { role: string; school: string; bio: string }
> = {
  "Nguyễn Minh Anh": {
    role: "Chuyên gia Sư phạm · Top 1",
    school: "THPT Chuyên Ngoại Ngữ",
    bio: "8 năm giảng dạy tiếng Anh giao tiếp & luyện thi. Đam mê thiết kế hoạt động khởi động lớp học tương tác.",
  },
  "Trần Thu Hà": {
    role: "Cố vấn Học liệu · Top 2",
    school: "Tiểu học & THCS Quốc tế",
    bio: "Chuyên xây dựng trò chơi từ vựng và phiếu bài tập phân hóa cho học sinh lứa tuổi Kids & Teens.",
  },
  "Lê Hoàng Nam": {
    role: "Người truyền lửa · Top 3",
    school: "THCS Cầu Giấy",
    bio: "Yêu thích phương pháp TBLT và ứng dụng công nghệ giúp học sinh tự tin thuyết trình tiếng Anh.",
  },
  "Phạm Linh Chi": {
    role: "Cộng tác viên tích cực",
    school: "THPT Nguyễn Tất Thành",
    bio: "Chia sẻ kinh nghiệm quản lý lớp học tích cực và kỹ thuật sửa lỗi phát âm tinh tế.",
  },
};

export const initialDiscussions: Discussion[] = [
  {
    id: "1",
    title: "Làm sao để học sinh bớt ngại nói tiếng Anh?",
    content:
      "Chào các thầy cô, lớp 8 của mình dạo này rất lười phát biểu tiếng Anh. Dù mình đã khuyến khích và cho điểm cộng nhưng các em vẫn sợ sai. Thầy cô nào có kinh nghiệm hay trò chơi nào giúp các em mạnh dạn hơn không ạ?",
    author: "Nguyễn Minh Anh",
    initials: "MA",
    color: "avatar-mint",
    category: "Phương pháp",
    createdAt: "2 giờ trước",
    upvotes: 19,
    upvotedBy: ["Trần Thu Hà", "Lê Hoàng Nam"],
    comments: [
      {
        id: "101",
        author: "Lê Hoàng Nam",
        initials: "HN",
        color: "avatar-blue",
        content:
          "Mình hay cho các em chơi trò '30s Non-stop' theo cặp trước. Không chấm điểm ngữ pháp, chỉ cần nói liên tục không ngắt quãng là được cộng sao.",
        createdAt: "1 giờ trước",
        upvotes: 4,
        upvotedBy: ["Nguyễn Minh Anh"],
      },
      {
        id: "102",
        author: "Trần Thu Hà",
        initials: "TH",
        color: "avatar-gold",
        content:
          "Thầy cô thử áp dụng kỹ thuật Think–Pair–Share chuẩn 3 bước xem: cho các em 45 giây viết từ khóa ra giấy nháp trước, sau đó thảo luận cặp đôi 2 phút rồi mới mời đại diện chia sẻ ý của bạn mình. Tỷ lệ giơ tay tăng rõ rệt luôn ạ!",
        createdAt: "45 phút trước",
        upvotes: 14,
        upvotedBy: ["Nguyễn Minh Anh", "Lê Hoàng Nam", "Phạm Linh Chi"],
      },
    ],
  },
  {
    id: "2",
    title: "Xin tài liệu ôn tập cuối kỳ cho lớp 7",
    content:
      "Sắp tới thi học kỳ rồi, thầy cô nào có bộ đề cương ôn tập môn tiếng Anh lớp 7 bám sát sách Global Success cho mình xin tham khảo với ạ. Mình cảm ơn nhiều!",
    author: "Trần Thu Hà",
    initials: "TH",
    color: "avatar-gold",
    category: "Tài liệu",
    createdAt: "Hôm qua",
    upvotes: 11,
    upvotedBy: ["Nguyễn Minh Anh"],
    comments: [
      {
        id: "201",
        author: "Nguyễn Minh Anh",
        initials: "MA",
        color: "avatar-mint",
        content:
          "Mình vừa chia sẻ bộ tổng hợp ngữ pháp trọng tâm Unit 1–6 ở mục Tài liệu trang chủ, thầy cô qua tải về dùng thử nhé!",
        createdAt: "5 giờ trước",
        upvotes: 7,
        upvotedBy: ["Trần Thu Hà"],
      },
    ],
  },
  {
    id: "3",
    title: "Chia sẻ hoạt động warm-up không cần máy chiếu",
    content:
      "Lớp học chỗ mình thỉnh thoảng bị cúp điện hoặc máy chiếu chập chờn. Mình thường cho các em chơi 'Word Chain' hoặc 'Back to the Board'. Thầy cô còn trò nào hay mà chỉ cần phấn và bảng không?",
    author: "Lê Hoàng Nam",
    initials: "HN",
    color: "avatar-blue",
    category: "Hoạt động lớp",
    createdAt: "2 ngày trước",
    upvotes: 15,
    upvotedBy: ["Phạm Linh Chi"],
    comments: [
      {
        id: "301",
        author: "Phạm Linh Chi",
        initials: "LC",
        color: "avatar-coral",
        content:
          "Trò 'Stop the Bus' rất hợp khi mất điện: kẻ 4 cột (Country, Food, Animal, Verb) lên bảng, bốc 1 chữ cái bất kỳ, nhóm nào điền xong cả 4 cột nhanh nhất hô to 'Stop the Bus!' để chốt điểm.",
        createdAt: "1 ngày trước",
        upvotes: 9,
        upvotedBy: ["Lê Hoàng Nam", "Nguyễn Minh Anh"],
      },
    ],
  },
  {
    id: "4",
    title: "Nên sửa lỗi phát âm ngay hay sau khi học sinh nói xong?",
    content:
      "Trong hoạt động luyện nói tự do (Fluency), nếu học sinh phát âm sai nhiều từ cơ bản thì mình nên ngắt lời sửa ngay để tránh thành thói quen, hay ghi chú lại rồi chữa chung cuối giờ ạ?",
    author: "Phạm Linh Chi",
    initials: "LC",
    color: "avatar-coral",
    category: "Hỏi đáp",
    createdAt: "3 ngày trước",
    upvotes: 8,
    upvotedBy: [],
    comments: [],
  },
];

export const featuredTool: ToolItem = {
  id: "gameshow",
  title: "Game Show Creator",
  description:
    "Nhập bộ câu hỏi một lần, tạo ngay một game show sống động cho cả lớp với điểm số và hiệu ứng trực quan.",
  badge: "★",
  themeClass: "tool-mint",
};

export const tools: ToolItem[] = [
  {
    id: "wheel",
    title: "Vòng quay từ vựng",
    description: "Biến danh sách từ thành trò chơi ngẫu nhiên đầy hào hứng.",
    badge: "Aa",
    themeClass: "tool-mint",
  },
  {
    id: "bingo",
    title: "Bingo Creator",
    description: "Tạo thẻ bingo có thể in chỉ trong vài giây.",
    badge: "25",
    themeClass: "tool-gold",
  },
  {
    id: "quiz",
    title: "Quiz nhanh",
    description: "Tạo câu hỏi trắc nghiệm và trình chiếu trực tiếp.",
    badge: "?",
    themeClass: "tool-coral",
  },
  {
    id: "scramble",
    title: "Word Scramble",
    description: "Xáo trộn chữ cái cho hoạt động ôn tập vui nhộn.",
    badge: "ABC",
    themeClass: "tool-blue",
  },
  {
    id: "exit-ticket",
    title: "Exit Ticket",
    description: "Thu nhận phản hồi cuối giờ từ cả lớp.",
    badge: "✓",
    themeClass: "tool-purple",
  },
  {
    id: "worksheet",
    title: "Worksheet Maker",
    description: "Tạo phiếu bài tập đẹp, rõ ràng và sẵn sàng để in.",
    badge: "A4",
    themeClass: "tool-green",
  },
];